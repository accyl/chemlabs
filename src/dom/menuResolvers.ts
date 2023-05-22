import 'jquery';

export function newByFormula(formula?: string) {
    if (!formula) {
        formula = $("#input-new-by-formula").val() as string;
    }
    $.ajax({
        url: `http://localhost:3000/api/formula/${encodeURIComponent(formula)}` // ,
        // context: document.body
    }).done(function (data) {
        console.log(data);

    });
}
export function newByName(name?: string) {
    let first, second;
    if(!name) {
        name = $("#input-new-by-name").val() as string;
    }
    if(name.includes(' ')) {
        first = name.substring(0, name.indexOf(' '));
        second = name.substring(name.indexOf(' ') + 1);
    } else {
        first = name;
    }
    let urlpart = `${encodeURIComponent(first)}`;
    if(second) urlpart += `/${encodeURIComponent(second)}`;
    $.ajax({
        url: `http://localhost:3000/api/formula/${urlpart}` // ,
        // context: document.body
    }).done(function (data) {
        console.log(data);

    });
}
export function newByWStr(wstr: string) {
}

