import MyHttp from "../http/myhttp";
 

document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.container');
    MyHttp.init(container);
    
})