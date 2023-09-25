import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"


class ThreeBuild{
    constructor(){
        this.dom = null;//元素容器
        this.mixerList = [];//动画混合器 列表 （缓存多个动画）
        this.animateActionList = [];//动画控制器列表
        this.scene = null;//场景
        this.render = null;//渲染器
        this.camera = null;//相机
        this.cameraControls = null;//轨道控制器
        this.geometry = null;//物体
        this.material = null;//材质
        // this.mesh = null;//网格 （物体的基础）
        this.meshGroup = [];// 物体 组
        this.raycaster = null;// 光线射线
        this.raycasterHandle = null;//光线投射 处理函数
        this.pointer = null;// 鼠标二位平面坐标
        this.select = null;//选中 物体
        this.clock = new THREE.Clock();//时钟
    }
    /**
     * 设置 场景
     * @param {Object} option 
     * @returns this
     */
    setScene(option){
        let {background,backgroundBlurriness} = option;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(background?background:0xffffff);
        this.scene.backgroundBlurriness = backgroundBlurriness?backgroundBlurriness:0;
        return this;
    }
    /**
     * 辅助线
     */
    initHelper(){

        this.scene.add(new THREE.AxesHelper(100))
        return this;
    }
    /**
     * 设置渲染器
     * @param {Function} callBack 
     * @returns this
     */
    setRenderer(callBack){
        this.render = callBack(THREE);
        return this;
    }

    /**
     * 设置 WebGL渲染器
     * @param {Object} option 
     * @returns this
     */
    setWebGlRenderer(dom,option){
        this.dom = dom;
        this.render = new THREE.WebGLRenderer(option);
        this.render.setPixelRatio( window.devicePixelRatio );
        this.render.setSize( dom.offsetWidth, dom.offsetHeight );
        dom.appendChild( this.render.domElement );
        return this;
    }

    /**
     * 设置 鼠标移过物体的 光线
     * @param {Function} callBack 回调函数 intersects 处理鼠标已过的相交物体
     * @returns this
     */
    setRaycaster(callBack){
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.raycasterHandle = (scene,camera,render,raycaster,pointer,select)=>{
            raycaster.setFromCamera(pointer,camera);
            const intersects = raycaster.intersectObjects(scene.children,true);
            callBack && callBack(intersects,select);
            render.render(scene,camera)
        }
        return this;
    }
    /**
     * 设置 鼠标坐标
     * @param {*} event 
     */
    onPointerMove(event){
        this.pointer.x = ( event.offsetX / this.dom.offsetWidth) * 2 - 1;
        this.pointer.y = -( event.offsetY / this.dom.offsetHeight) * 2 + 1;
        // console.log("x",this.pointer.x,"y",this.pointer.y);
    }
    /**
     * 加载 3d建模
     * @param {String} path 建模静态路径
     * @param {String} name 建模名称
     * @returns this
     */
    setGLTFLoader(path,name){
        return new Promise((resolve,reject)=>{
            if(!this.scene){
                throw new Error("缺少scene场景 实例")
            }
            const dracoLoader = new DRACOLoader();
            let url = new URL(path,import.meta.url).href;
            let gltf = new URL("./gltf/",import.meta.url).href;
            dracoLoader.setDecoderPath(gltf+"/");
    
            let loader = new GLTFLoader();
            loader.setDRACOLoader(dracoLoader);
            loader.load(url,gltf=>{
                const model = gltf.scene;
                model.name = name;
                let mixer = new THREE.AnimationMixer(model);
                mixer.name =name;
                this.mixerList.push(mixer)
                this.scene.add( model );
                resolve({model,mixer,gltf})
            },undefined,error=>{
                console.log('GLTF 加载 error',error)
                reject()
            })
          
        })
     
    }

    /**
     * 设置 相机
     * @param {Function} callBack 
     * @returns this
     */
    setCamera(callBack){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        this.camera = callBack(THREE);
        this.scene.add(this.camera);
        return this;
    }

    /**
     * 设置 透视相机
     * @param {Object} option 
     * @returns this
     */
    setPerspectiveCamera(option){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        let {fov,aspect,near,far,x,y,z} = option;
        this.camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
        this.camera.position.set(x,y,z);
        this.scene.add(this.camera);
        return this;
    }

    /**
     * 设置 正交相机
     * @param {Object} option 
     * @returns 
     */
    setOrthographicCamera(option){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        let {left,right,top,bottom,near,far,x,y,z} = option;
        this.camera = new THREE.OrthographicCamera(left,right,top,bottom,near,far);
        this.camera.position.set(x,y,z);
        this.scene.add(this.camera);
        return this;
    }

    /**
     * 设置物体
     * @param {Function} callBack 
     * @returns this
     */
    setGeometry(callBack){
        this.geometry = callBack(THREE);
        return this;
    }

    /**
     * 设置 材质
     * @param {Function} callBack 
     * @returns this
     */
    setMaterial(callBack){
        this.material = callBack(THREE);
        return this;
    }

    /**
     * 设置 物体网格
     * @param {String} name 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @returns this
     */
    setMesh(name='',x=0,y=0,z=0,isGroup=false){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        let mesh = new THREE.Mesh(this.geometry,this.material);
        mesh.name = name;
        mesh.position.set(x,y,z);
        if(isGroup){
            this.meshGroup.push(mesh)
        }else{
            this.scene.add(mesh);
        }
        this.geometry = null;
        this.material = null;
        return this;
    }

    /**
     * 添加 物体组
     * @param {String} name 组名称
     * @returns 
     */
    addMeshGroup(name){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        if(this.meshGroup.length==0){
            throw new Error("meshList不能为空！")
        }
        let group = new THREE.Group();
        this.meshGroup.forEach(e=>{
            group.add(e);
        })
        group.name = name;
        this.scene.add(group);
        return this;
    }
    /**
     * 设置光源
     * @param {Function} callBack 
     * @returns this
     */
    setLight(callBack){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        let light = callBack(THREE);
        this.scene.add(light);
        return this;
    }

    /**
     * 设置 环境光
     * @param {*} color 
     * @param {*} intensity 
     * @returns this
     */
    setAmbientLight(color=0xffffff,intensity=1,x=0,y=0,z=0){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        let light = new THREE.AmbientLight(color,intensity);
        light.name = "ambientLight";
        light.position.set(x,y,z)
        this.scene.add(light);
        return this;
    }
    
    /**
     * 设置 聚光灯
     * @param {*} color 
     * @param {*} intensity 
     * @returns this
     */
    setSpotLight(targetName,color=0xffffff,intensity=1,near=500,far=100,fov=30,x=0,y=0,z=0){
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        let target;
        if(targetName){
            target = this.scene.children.find(e=>e.name == targetName);
        }
        let light = new THREE.SpotLight(color,intensity);
        light.name = "spotLight";
        light.intensity = intensity;
        light.shadow.camera.near = near;
        light.shadow.camera.far = far;
        light.shadow.camera.fov = fov;
        target && (light.target = target);
        light.position.set(x,y,z)
        this.scene.add(light);
        return this;
    }

    /**
     * 设置 轨道控制器
     * @param {Object} option 
     * @returns this
     */
    setOrbitControls(option){
        if(!this.camera || !this.render){
            throw new Error("没有 camera相机 或 render渲染器")
        }
        if(!this.cameraControls){
            this.cameraControls = new OrbitControls(this.camera,this.render.domElement);
        }
        let keys = Object.keys(option);
        let controlKeys = Object.keys(this.cameraControls);
        if(!option || keys.length ==0){
            return;
        }
        for(var i=0;i<keys.length;i++){
            if(controlKeys.includes(keys[i])){
                this.cameraControls[keys[i]] = option[keys[i]];
            }
        }
        this.cameraControls.update()
        return this;
    }
    /**
     * 给物体添加 动画混合器
     * @param {String} geometryName 物体在场景中名称
     * @param {String} mixerName 混合器名称
     * @param {String} clipName 动画剪切名称
     * @param {Number} duration 动画时间
     * @param {Array} tracks 轨道动画路径 数组
     * @param {Function} callBack 
     * @returns this
     */
    addAnimationMixer(geometryName,mixerName,clipName,duration,tracks,callBack){
        // console.log(tracks);
        if(!this.scene){
            throw new Error("缺少scene场景 实例")
        }
        let find = this.scene.children.find(e=>e.name == geometryName);
        if(!find){
            throw new Error("在scene场景 没找到物体实例")
        }
        let mixer = new THREE.AnimationMixer(find);
        let clip = new THREE.AnimationClip(clipName,duration,tracks);
        mixer.name = mixerName;
        let action = mixer.clipAction(clip);
        action.name = geometryName;
        this.animateActionList.push(action);
        callBack && callBack(action,THREE);

        action.play()
        this.mixerList.push(mixer);
        return this;
    }

    /**
     * 获得 轨道动画 数组
     * @param {Array} trackObjArray 轨道数组对象
     * @returns Array
     */
    getKeyframeTrack(trackObjArray){
        let result = [];
        trackObjArray.forEach(e=>{
            let track = new THREE[e.moduleName](e.name,e.times,e.values);
            result.push(track)
        })
        return result;
    }

    /**
     * 获取动画控制器
     * @param {String} name 物体名称 
     * @returns THREE.AnimateAction
     */
    getAnimationAction(name){
        let find = this.animateActionList.find(e=>e.name == name);
        return find;
    }

    /**
     * 执行 渲染
     * @param {Function} callBack 
     */
    animate(callBack){
        
        let _this = this;
        let option = {
            camera:this.camera,
            scene : this.scene,
            render: this.render
        }
        function _animate(){
            requestAnimationFrame( _animate );
            let delta;
            delta = _this.clock &&  _this.clock.getDelta();
            callBack && callBack(option)
            _this.cameraControls && _this.cameraControls.update();
            _this.mixerList.length>0 && _this.mixerList.forEach(mixer=>mixer.update(delta));
            _this.raycasterHandle && _this.raycasterHandle(_this.scene,_this.camera,_this.render,_this.raycaster,_this.pointer,_this.select);
            _this.render.render(_this.scene,_this.camera)
        }
        _animate()
    }
}

export default ThreeBuild;

