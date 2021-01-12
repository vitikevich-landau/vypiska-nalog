const {timer} = require('rxjs');
const _ = require('lodash');
const {startSearch} = require('./selenium');
const {Parser, info, parseInfo, groupBy, convertToSave, traverse} = require('./parser');
const {File} = require('./files');

(async () => {
    File.deleteIfExists(File.SOURCE);
    File.deleteIfExists(File.INFO);
    File.deleteIfExists(File.GROUP_BY_INN_KPP_MORE);
    File.deleteIfExists(File.GROUP_BY_INN_KPP_MORE);
    File.deleteIfExists(File.SAME);
    File.deleteIfExists(File.DIFFERENCE);

    const action = ({iteration, url, pageSource}) => {
        const parser = new Parser(pageSource);
        const html = parser.getHtml('.table.reee_table');
        const information = [iteration, ...info(parser), url];


        File.save(File.SOURCE, `iteration: ${iteration}|<table>${html}</table>|${url}`);
        File.save(File.INFO, information.join('|'));
    };

    await startSearch(action);

    /**
     *  После сбора инфы, формируем файлы
     */
    const subscription = timer(5000)
        .subscribe(
            () => {
                const info = parseInfo('info.csv');

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
                File.save(File.GROUP_BY_INN_KPP_ONCE, convertToSave(byInnKppOnce).join('\n'));
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
                File.save(File.GROUP_BY_INN_KPP_MORE, convertToSave(byInnKppMore).join('\n'));
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

                File.save(File.SAME, convertToSave(same).join('\n'));
                File.save(File.DIFFERENCE, convertToSave(difference).join('\n'));

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
