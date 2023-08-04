function onError(error) {
    console.log(error);
}

save = document.querySelector('.submit');
input = document.querySelector('input[class="retention"]');

let retention_item = browser.storage.local.get("retention");
retention_item.then((result) => {
    let objTest = Object.values(result);
    input.valueAsNumber = objTest[0];
}, onError);

// console.log(input);

save.addEventListener('click', submit_save);

function submit_save() {
    let retention_days = input.valueAsNumber;
    // console.log(retention_days);
    let storing = browser.storage.local.set({ "retention": retention_days });
    storing.then(() => {
        input.valueAsNumber = retention_days;
    }, onError);
}
