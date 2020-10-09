$(document).ready(function() {
	$('.nav-trigger').click(function() {
		$('.side-nav').toggleClass('visible');
	});
});

let categorySubMenu = document.getElementById('sub-menu-category');
let userSubMenu = document.getElementById('sub-menu-user');
let postSubMenu = document.getElementById('sub-menu-post');
let categoryMenu = document.getElementById('category-sub');
let userMenu = document.getElementById('user-sub');
let postMenu = document.getElementById('post-sub');

categorySubMenu.addEventListener('click', () => {
	categoryMenu.classList.toggle('sub-category-visible');
})
userSubMenu.addEventListener('click', () => {
	userMenu.classList.toggle('sub-category-visible');
})
postSubMenu.addEventListener('click', () => {
	postMenu.classList.toggle('sub-category-visible');
})

//Register Form Validator
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');
const submitBtn = document.getElementById('submitBtn');

//Check if input fields are not empty
// // submitBtn.addEventListener('submit', () => {
// 	if (username.value == '' || email.value == '' || password.value == '' || password2.value == '') {
// 		console.log('Fill all input');
// 	}
// })