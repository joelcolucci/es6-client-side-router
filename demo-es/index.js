import Router from '/assets/router-es.js';


let router = new Router();


router.on('/:id', (ctx) => {
  let main = document.querySelector('main');

  let elem = document.createElement('h1');
  elem.textContent = `Im the ${ctx.params.id} page.`;

  main.innerHTML = '';
  main.appendChild(elem);
});


router.on('/', (ctx) => {
  let main = document.querySelector('main');

  let elem = document.createElement('h1');
  elem.textContent = 'Im the root page.';

  main.innerHTML = '';
  main.appendChild(elem);
});


router.enable();