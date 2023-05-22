

// Get all the dropdown menu items
let dropdowns = document.querySelectorAll('.dropdown');

// Add a click event listener to each dropdown item
dropdowns.forEach(function (dropdown) {
    console.log('hii');
    // Get the dropdown content
    let dropdownContent = dropdown.querySelector('.dropdown-content')!;

    // Add a click event listener to the dropdown item
    dropdown.addEventListener('click', function () {
        // Toggle the 'show' class on the dropdown content
        dropdownContent.classList.toggle('show');
    });
    // // Hide the dropdown content when the user clicks outside of it
    // window.addEventListener('click', function (event) {

    //     let ele = event.target as Element;
    //     if(ele.matches('.dropdown')) {
    //         if(ele === dropdown) return; // make sure that only 1 menu is open at a time
    //     } else if(ele.matches('.dropdown-item')) {
    //         if(ele.parentElement === dropdownContent) return;
    //     }
    //     dropdownContent.classList.remove('show');
    // });

});

// https://www.w3schools.com/howto/howto_css_modals.asp
function linkMenuModal(id: string) {
    let modal = document.getElementById(`modal-${id}`)!;
    // Get the button that opens the modal
    let btn = document.getElementById(`menu-${id}`)!;

    // Get the <span> element that closes the modal
    let span = modal.querySelector('span.modal-close') as HTMLSpanElement;

    // When the user clicks on the button, open the modal
    btn.onclick = function () {
        modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    };
}
// $('.menu-new-by-name').on('click', () => {
//     console.log('hii');
//     $('#modal-new-by-name').toggle();

// });
linkMenuModal('new-by-name');
// linkMenuModal('new-by-wstr');
linkMenuModal('new-by-formula');
// linkMenuModal('new-by-smiles');
// linkMenuModal('new-by-inchi');

// Hide the dropdown content when the user clicks outside of it
window.addEventListener('click', function (event) {

    let ele = event.target as Element;
    let target = undefined;
    if (ele.matches('.dropdown-item')) {
        let target = ele.parentElement?.parentElement;
        if(target?.matches('.dropdown')) return;
    } else if (ele.matches('.dropdown')) {
        target = ele;
    }
    for(let dropdown of dropdowns) {
        if(dropdown === target) continue;
        let dropdownContent = dropdown.querySelector('.dropdown-content')!;
        dropdownContent.classList.remove('show');
    }
        // return;// make sure that only 1 menu is open at a time
    
});
