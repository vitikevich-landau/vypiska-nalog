/***
 * Сбор со страницы всей информации об организации
 *
 */
const collectInformation = async driver => {
    const dataTableCssClass = 'table reee_table';
    const rows = await driver.findElements(By.className(dataTableCssClass));
    const [row] = rows;
    return row.getText();
};

const getCompanyTitle = info =>
    info.split('\n')
        .map(v => v.toUpperCase())
        .filter(v => v.includes('НАИМЕНОВАНИЕ КОМПАНИИ'))
        .map(v => v.replace('НАИМЕНОВАНИЕ КОМПАНИИ', '').trim())
        [0];

/***
 *  Вернуть значение по аименованию кода
 *
 */
const getCode = (info, codeTitle) =>
    info
        .split('\n')
        .filter(v => v.includes(codeTitle))
        .map(v => v.replace(codeTitle, '').trim())
        [0];

/***
 *
 * Коды ОКВЭД
 *
 */
const getCodes = info => {
    /***
     *  TODO
     */
    const findCodesLinesRegex = /^[0-9]/;
    const findOnlyCodesInLine = /[0-9]+(\.[0-9]+)*/;

    const lines = info.split('\n');
    const linesWithCodes = lines.filter(v => findCodesLinesRegex.test(v));

    return linesWithCodes.map(v => v.match(findOnlyCodesInLine)[0]);
}

module.exports = {
    collectInformation,
    getCompanyTitle,
    getCodes,
    getCode
};
