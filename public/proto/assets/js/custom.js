const decrementButton = document.querySelectorAll(`[data-action="decrement"]`);

const incrementButton = document.querySelectorAll(`[data-action="increment"]`);

const btnAdd = document.getElementsByClassName('btn-add-to');

decrementButton.forEach((button) => {
    function decrement(e) {
        const button = e.target.parentNode.parentElement.querySelector(
            '[data-action="decrement"]'
        );
        const target = button.nextElementSibling;
        let value = Number(target.value);
        value--;
        target.value = value;
        if (target.value < 0) {
            target.value = "0";
        }
    }
    button.addEventListener("click", decrement);
});

incrementButton.forEach((button) => {
    function increment(e) {
        const button = e.target.parentNode.parentElement.querySelector(
            '[data-action="decrement"]'
        );
        const target = button.nextElementSibling;
        let value = Number(target.value);
        value++;
        target.value = value;
    }
    button.addEventListener("click", increment);
});

for (let i = 0; i < btnAdd.length; i++) {
    btnAdd[i].onclick = function () {
        this.classList.add('delete');
    }
}

const main1 = document.getElementById('main1');
const main1res = document.getElementById('main1-res');
const btnBack1 = document.getElementById('back1');
const btnBack2 = document.getElementById('back2');
const btnBack11 = document.getElementById('back11');
const btnBack22 = document.getElementById('back22');

main1.addEventListener('click', () => {
    main1res.classList.add('list-active');
})

btnBack1.addEventListener('click', () => {
    main1res.classList.remove('list-active');
})

const main11 = document.getElementById('main1-1');
const main11res = document.getElementById('res-main-1-1');

main11.addEventListener('click', () => {
    main11res.classList.add('list-active-glo');
})
btnBack11.addEventListener('click', () => {
    main11res.classList.remove('list-active-glo');
})

const main12 = document.getElementById('main1-2');
const main12res = document.getElementById('res-main-1-2');

main12.addEventListener('click', () => {
    main12res.classList.add('list-active-glo');
})

btnBack22.addEventListener('click', () => {
    main12res.classList.remove('list-active-glo');
})

const main2 = document.getElementById('main2');
const main2res = document.getElementById('main2-res');
const btnBack3 = document.getElementById('back3');

main2.addEventListener('click', () => {
    main2res.classList.add('list-active');
})

btnBack3.addEventListener('click', () => {
    main2res.classList.remove('list-active');
})

