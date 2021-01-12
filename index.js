const {timer} = require('rxjs');
const _ = require('lodash');
const {launchDriver} = require('./app/selenium');
const {Parser, collectInformation, parseInfo, groupBy, formatBeforeSave, traverse} = require('./app/parser');
const {File} = require('./app/files');

(async () => {

    File.deleteStore();

    const action = ({iteration, url, pageSource}) => {
        const parser = new Parser(pageSource);
        const html = parser.getHtml('.table.reee_table');
        const information = [iteration, ...collectInformation(parser), url];


        File.save(File.SOURCE, `iteration: ${iteration}|<table>${html}</table>|${url}`);
        File.save(File.INFO, information.join('|'));
    };

    await launchDriver(action);

    /**
     *  После сбора инфы, формируем файлы
     */
    const subscription = timer(5000)
        .subscribe(
            () => {
                const info = parseInfo(File.INFO);

                const byInnKpp = groupBy(info, ['inn', 'kpp']);
                /***
                 *  Save
                 */
                const byInnKppOnce = _.chain(byInnKpp)
                    .map(v => _.map(v, k => k))
                    .flatten()
                    .filter(v => v.length < 2)
                    .flatten()
                    .value()
                ;
                File.save(File.GROUP_BY_INN_KPP_ONCE, formatBeforeSave(byInnKppOnce).join('\n'));
                // console.log(convertToSave(byInnKppOnce));

                /***
                 *  Save
                 */
                const byInnKppMore = _.chain(byInnKpp)
                    .map(v => _.map(v, k => k))
                    .flatten()
                    .filter(v => v.length > 1)
                    .flatten()
                    .value()
                ;
                File.save(File.GROUP_BY_INN_KPP_MORE, formatBeforeSave(byInnKppMore).join('\n'));
                // console.log(convertToSave(byInnKppMore));

                /***
                 *  Доп. группировка по дубликатам
                 *  Ищем одинаковые элементы
                 *
                 */
                const grouped = groupBy(byInnKppMore, ['inn', 'kpp', 'title', 'codes']);

                /***
                 *  Записи, в которых одинаковые 'inn', 'kpp', 'title', 'codes'
                 *
                 *  Берём только первые, ибо сгруппированыые записи одинаковые
                 */
                const same = traverse(grouped).filter(v => v.length > 1)/*.flatMap(v => v)*/.map(_.first);
                const difference = traverse(grouped).filter(v => v.length < 2).flatMap(v => v);

                File.save(File.SAME, formatBeforeSave(same).join('\n'));
                File.save(File.DIFFERENCE, formatBeforeSave(difference).join('\n'));

                File.save(`group_by_inn_kpp_once+same.csv`, formatBeforeSave(_.concat(byInnKppOnce, same)));

                console.log(
                    _.concat(byInnKppOnce, same).length,
                    byInnKppOnce.length,
                    byInnKppMore.length,
                    same.length,
                    difference.length
                )


            },
            error => console.error(error),
            () => subscription.unsubscribe()
        );


})();
