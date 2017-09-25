(()=>{
    var world = new GameWorld(window.innerWidth, 0.9*window.innerHeight, 7, 7, document.body);
    function animate(){
        requestAnimationFrame(animate);
        world.run();
    }
    animate();
})()
