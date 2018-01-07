class MovingCamera{
    constructor(camera){
        MovingCamera.PI_2 = Math.PI/2;
        this._camera = camera;
        this._wrap_object = new THREE.Object3D();
        var position = camera.position.clone();
        var rotation = camera.rotation.clone();
        camera.position.set(0,0,0);
        camera.rotation.set(0,0,0);
        this._wrap_object.add(camera);
        this._wrap_object.position.x = position.x;
        this._wrap_object.position.y = position.y;
        this._wrap_object.position.z = position.z;
    }
    get position(){
        return this._wrap_object.position;
    }
    clear_direction(){
        this._wrap_object.rotation.y = 0;
        this._camera.rotation.x = 0;
    }
    getObject(){
        return this._wrap_object;
    }
    rotateUp(detal){
        this._camera.rotation.x += detal;
        this._camera.rotation.x = this._correct_rotation_x(this._camera.rotation.x)
    }
    rotateDown(detal){
        this._camera.rotation.x -= detal;
        this._camera.rotation.x = this._correct_rotation_x(this._camera.rotation.x)
    }
    rotateRight(detal){
        this._wrap_object.rotation.y += detal;
    }
    rotateLeft(detal){
        this._wrap_object.rotation.y -= detal;
    }
    moveForward(detal){
        this._wrap_object.translateZ(-detal);
    }
    moveBackward(detal){
        this._wrap_object.translateZ(detal);
    }
    moveLeft(detal){
        this._wrap_object.translateX(-detal);
    }
    moveRight(detal){
        this._wrap_object.translateX(detal);
    }
    _correct_rotation_x(x){
        return Math.max(-MovingCamera.PI_2, Math.min(MovingCamera.PI_2, x));
    }
}

class Person extends MovingCamera{
    constructor(camera){
        super(camera);
        this._enabled = false;
        this._previous_position = this.position.clone();
        this._state = "stand";
        this._speed = 1.0;
    }
    update(detal){
        console.log(detal);
        switch(this._state){
            case "forward":
            this.moveForward(this._speed*detal);
            break;
            case "backward":
            this.moveBackward(this._speed*detal);
            break;
            case "left":
            this.moveLeft(this._speed*detal);
            break;
            case "right":
            this.moveRight(this._speed*detal);
            break;
        }
    }
    addKeyListerner(html_element){
        document.addEventListener("pointerlockchange", (e)=>{
            if(document.pointerLockElement !== this._html_element){
                this.enabled = false;
            }
        });
        html_element.addEventListener("keypress", (e)=>{
            if(e.code === "Enter")
                this.enabled = true;
            if(this.enabled !== true)
                return;
            this._previous_position.fromArray(this.position.toArray());
            switch(e.code){
                case "KeyW":
                this._state = "forward";
                break;
                case "KeyS":
                this._state = "backward";
                break;
                case "KeyA":
                this._state = "left";
                break;
                case "KeyD":
                this._state = "right";
                break;
                default:
                console.log(e.code);
                break;
            }
        });
        html_element.addEventListener("keyup", (e)=>{
            this._state = "stand";
        });
    }
    addMouseListerner(html_element){
        this._html_element = html_element;
        html_element.addEventListener("mousemove", (e)=>{
            if(this.enabled !== true)
                return;
            this.rotateRight(-e.movementX*0.002);
            this.rotateUp(-e.movementY*0.002);
        });
    }
    set enabled(value){
        if(value && this._html_element){
            this._html_element.style.cursor = "none";
            this._html_element.requestPointerLock();
        }
        else if(this._html_element){
            this._html_element.style.cursor = "auto";
            document.exitPointerLock();
        }
        this._enabled = value;
    }
    get enabled(){
        return this._enabled;
    }
    get previous_position(){
        return this._previous_position;
    }
}

class Maze {
    constructor(line, row){
        this._line = line;
        this._row = row;
    }
    get line(){
        return this._line;
    }
    get row(){
        return this._row;
    }
    get data(){
        return this._mazedata;
    }
    generate(){
        this._mazedata = new Array(2*this.line+1);
        for(var i = 0; i < 2*this.line+1; i++)
            this._mazedata[i] = new Array(2*this.row+1).fill('x');
        var count = 1;
        var total_count = this._line*this._row;
        var current_point = [1, 1];
        this._mazedata[current_point[0]*2-1][current_point[1]*2-1] = 'o';
        var next_point;
        var stack_points = [];
        while(count<total_count){
            if(next_point = this._next_point(current_point)){
                this._mazedata[next_point[0]*2-1][next_point[1]*2-1] = 'o';
                this._fill_path(current_point, next_point);
                stack_points.push(current_point);
                current_point = next_point;
                count++;
            }else{
                current_point = stack_points.pop();
            }
        }
    }
    clear(){
        if(this._mazedata){
            for(var i=0; i<2*this._line+1; i++)
                for(var j=0; j<2*this._row+1; j++)
                    this._mazedata[i][j] = 'x';
        }
    }
    _fill_path(p1, p2){
        this._mazedata[p1[0]+p2[0]-1][p1[1]+p2[1]-1] = 'o';
    }
    _next_point(point){
        var direction = [];
        var test_point; 
        if((test_point=this._at(point[0]-1, point[1])) && test_point!=='o')
            direction.push(0);
        if((test_point=this._at(point[0]+1, point[1])) && test_point!=='o')
            direction.push(1);
        if((test_point=this._at(point[0], point[1]-1)) && test_point!=='o')
            direction.push(2);
        if((test_point=this._at(point[0], point[1]+1)) && test_point!=='o')
            direction.push(3);
        var n = this._random_int_arr(direction);
        switch(n){
            case 0:
            return [point[0]-1, point[1]];
            break;
            case 1:
            return [point[0]+1, point[1]];
            break;
            case 2:
            return [point[0], point[1]-1];
            break;
            case 3:
            return [point[0], point[1]+1];
            break;
            default:
            return undefined;
        }
    }
    _random_int_arr(int_arr){
        if(int_arr.length==0)
            return undefined;
        var n = Math.floor(Math.random()*int_arr.length);
        return int_arr[n];
    }
    _at(p){
        var x, y;
        if(arguments.length == 1)
            x = p[0], y = p[1];
        else
            x = arguments[0], y = arguments[1];
        if(x > 0 && x <= this._line)
            if(y > 0 && y <= this._row)
                return this._mazedata[2*x-1][2*y-1];
        return undefined;
    }
}

class MazeObject extends THREE.Object3D{
    constructor(w, h, c_w){
        super();
        this._maze = new Maze(w, h);
        this._c_w = c_w;
        MazeObject.init_geometry = new THREE.BoxGeometry(c_w, c_w, c_w);
        MazeObject.init_material = new THREE.MeshBasicMaterial({color: "#9F7E5B"});
        MazeObject.init_cube = new THREE.Mesh(MazeObject.init_geometry, MazeObject.init_material);
        var loader = new THREE.TextureLoader();
        var texture = loader.load("images/wall.jpg");
        MazeObject.init_material.map = texture;
    }
    generate(){
        this._maze.generate();
        this._generate_final();
        this._addCube();
    }
    get maze(){
        return this._maze;
    }
    get start_position(){
        return new THREE.Vector3(1.5*this._c_w,0.3*this._c_w,1.5*this._c_w);
    }
    get final_position(){
        return this._final_position;
    }
    _generate_final(){
        var line = Math.floor(Math.random()*this._maze.line)+1;
        var row = this._maze.row;
        this._maze.data[2*line-1][2*row] = 'o';
        this._final_position = new THREE.Vector3((2*row+0.5)*this._c_w,0,(2*line-0.5)*this._c_w);
    }
    _addCube(){
        var cube;
        var c_w_2 = this._c_w/2;
        var count = this.children.length;
        var n = 0;
        for(var i=0; i<2*this._maze.line+1; i++){
            for(var j=0; j<2*this._maze.row+1; j++){
                if(this._maze.data[i][j] === 'x'){
                    if(n < count){
                        this.children[n].position.z = i*this._c_w+c_w_2;
                        this.children[n].position.x = j*this._c_w+c_w_2;
                        n++;
                    }else{
                        cube = MazeObject.init_cube.clone();
                        cube.position.z = i*this._c_w+c_w_2;
                        cube.position.x = j*this._c_w+c_w_2;
                        cube.radius = c_w_2;
                        this.add(cube);
                    }
                }
            }
        }
        var n_count = this.children.length;
        for(var i=0; i<count-n_count; i++){
            this.remove(this.children[n_count+i]);
        }
    }
}

class ImpactSystem{
    constructor(){
        this._objects = [];
    }
    addObject(object){
        this._objects.push(object);
    }
    clear(){
        this._objects = [];
    }
    checkImpact(object){
        for(var i=0; i<this._objects.length; i++){
            if(this._check_two(object, this._objects[i])){
               
            }
        }
    }
    _check_two(o1, o2){
        var xflags = false;
        var zflags = false;
        if(Math.abs(o1.position.x-o2.position.x)<o1.radius+o2.radius){
            xflags = true;
        }
        if(Math.abs(o1.position.z-o2.position.z)<o1.radius+o2.radius){
            zflags = true;
        }
        if(xflags && zflags){
            o1.position.fromArray(o1.previous_position.toArray());
        }
        return xflags && zflags;
    }
}

class GameWorld{
    constructor(w, h, line, row, html_element){
        this._radius = 2.5;
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 1000);
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(w, h);
        this._html_element = html_element;
        this._systems = new ImpactSystem();
        html_element.appendChild(this._renderer.domElement);
        this._maze = new MazeObject(line, row, this._radius*2);
        this._person = new Person(this._camera);
        this._person.addKeyListerner(html_element);
        this._person.addMouseListerner(html_element);
        this._scene.add(this._maze);
        this._scene.add(this._person.getObject());
        this._person.radius = this._radius/3;
        this._time = new Date().getTime();
        this._newtime = this._time;
        this._detal = 0;
        this._generate_ground();
        this._init_maze();
        this._init_out();
        this._init_person();
        this._init_impact_system();
    }
    run(){
        this._judge_win();
        this._newtime = new Date().getTime();
        this._detal = (this._newtime - this._time) / 100.0;
        this._time = this._newtime;
        this._person.update(this._detal);
        this._systems.checkImpact(this._person);
        this._renderer.render(this._scene, this._camera);
        
    }
    _init_maze(){
        this._maze.generate();
    }
    _init_person(){
        this._person.clear_direction();
        this._person.position.fromArray(this._maze.start_position.toArray());
        this._person.rotateDown(0.5);
        if(this._maze.maze.data[1][2]==="o"){
            this._person.rotateLeft(Math.PI/2);
        }else{
            this._person.rotateLeft(Math.PI);
        }
            
    }
    _init_out(){
        if(!this._door){
            var plane_geometry = new THREE.BoxGeometry(1.9*this._radius, 2*this._radius, 1.9*this._radius);
            var material = new THREE.MeshBasicMaterial({color:0xEEEEEE});
            var plane = new THREE.Mesh(plane_geometry, material);
            var video =document.createElement("video");
            video.src="images/door.mp4";
            video.autoplay = true;
            video.loop = true;
            var texture = new THREE.VideoTexture(video);
            texture.minFilter = THREE.LinearFilter;
            material.map = texture;
            this._scene.add(plane);
            this._door = plane;
        }
        this._door.position.fromArray(this._maze.final_position.toArray());
        this._door.rotateY(-Math.PI/2);
    }
    _init_impact_system(){
        var system = this._systems;
        system.clear();
        for(var i=0; i<this._maze.children.length; i++){
            system.addObject(this._maze.children[i]);
        }
    }
    _generate_ground(){
        var width = 2*this._radius*(2*this._maze.maze.line+1);
        var heigth = 2*this._radius*(2*this._maze.maze.row+1);
        var plane_geometry = new THREE.PlaneGeometry(heigth, width);
        var material = new THREE.MeshBasicMaterial({color:0xEEFFEE});
        var plane = new THREE.Mesh(plane_geometry, material);
        var loader = new THREE.TextureLoader();
        var texture = loader.load("images/road.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2*this._maze.maze.row+1, 2*this._maze.maze.line+1);
        material.map = texture;
        plane.rotation.x = -Math.PI/2;
        plane.position.y = -this._radius;
        plane.position.x = heigth/2;
        plane.position.z = width/2;
        this._scene.add(plane);
    }
    _judge_win(){
        var width = 2*this._radius*2*this._maze.maze.line;
        var heigth = 2*this._radius*2*this._maze.maze.row;
        if(this._person.position.x > heigth){
            this._init_maze();
            this._init_out();
            this._init_person();
            this._init_impact_system();
        }
    }
}