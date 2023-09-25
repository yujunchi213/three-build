# three-build
three.js 构建工具，链式编程。

npm 引入 

``` npm install three-build --save ```

例子 vue3 使用
```
<style scoped>
    .three-container{
        width: 100%;
        height: 100%;
    }
</style>
<template>
    <div class="three-container" ref="domRef"></div>
</template>

<script setup>
import {ref,onMounted,toValue} from "vue";
import {ThreeBuild,ThreeContant} from "three-build";

let domRef = ref(null);
let threeBuild = new ThreeBuild();
onMounted(()=>{
    let dom = toValue(domRef);
    init(dom);
})
function init(dom){
    let {sceneOption,renderOption,
     orthographicCameraOption,orbitControlsOption,keyframeTrackOption} = ThreeContant;
    let sceneConfig = sceneOption();
    let renderConfig = renderOption();
    let cameraConfig = orthographicCameraOption()
    let orbitControlsConfig = orbitControlsOption();
    let track1 = keyframeTrackOption('VectorKeyframeTrack','zfx',"position",[0,1,2],[0,0,0,15,0,0,21,11,0,28,30,0]);
    let track2 = keyframeTrackOption('VectorKeyframeTrack','zfx',"scale",[0,1,2],[1,1,1,3,3,3,3,11,3,1,1,1]);
    renderConfig.alpha = true;
    sceneConfig.background = 0x555555;
    cameraConfig.aspect = dom.offsetWidth/dom.offsetHeight;
    cameraConfig.x = 50;
    cameraConfig.y = 50;
    cameraConfig.z = 50;
    threeBuild.setScene(sceneConfig)//创建场景
                .initHelper()//辅助线
                .setWebGlRenderer(dom,renderConfig)//创建渲染器
                .setOrthographicCamera(cameraConfig)//创建正交相机
                .setOrbitControls(orbitControlsConfig)//相机控制器
                .setGeometry(three=>new three.BoxGeometry(1,1,1))//物体
                .setMaterial(three=>new three.MeshMatcapMaterial({color:0x00ff00}))//材质
                .setMesh("zfx",5,10,12)//网格物体
                .setGeometry(three=>new three.BoxGeometry(3,2,1))
                .setMaterial(three=>new three.MeshMatcapMaterial({color:0xeeff00}))
                .setMesh("zfx2",12,11,3)
                //给指定的物体 创造动画
                .addAnimationMixer("zfx","zfx-mixer",'action',2,threeBuild.getKeyframeTrack([track1,track2]),(action,three)=>{
                    action.loop = three.LoopPingPong;
                })

                // 遍历创造多个 物体
                for(var i=0;i<100;i++){
                    threeBuild.setGeometry(three=>new three.BoxGeometry(1,1,1))
                                .setMaterial(three=>new three.MeshMatcapMaterial({color:0x00ff00}))
                                .setMesh("zz"+i,(5+i)*5,(10+i)*5,12,true)
                }
                threeBuild.addMeshGroup("zzGroup");
                // .setSpotLight("zfx",0x000000);

                //加载 GLTF 3d模型 返回一个 promise
                let a = threeBuild.setGLTFLoader("/src/assets/LittlestTokyo.glb","tokyo");

                //加载多个 3d模型，成功后，处理业务逻辑
                Promise.all([a]).then(params=>{
                    let {model,mixer,gltf} = params[0];
                    model.traverse(child=>{
                        if(child.isMesh){
                            child.material.emissive = child.material.color;
                            child.material.emissiveMap = child.material.map;
                        }
                    })
                    model.position.set(0,20,0);
                    model.scale.set(0.1,0.1,0.1);
                    mixer.clipAction(gltf.animations[0]).play();
                })
                //three 执行渲染动作 ，回调函数入参含有{scene，render,camera}
                threeBuild.animate(option=>{
                        let {scene} = option
                        let zfx = scene.children.find(e=>e.name=='zfx');
                        let zfx2 = scene.children.find(e=>e.name=='zfx2');
                        zfx.rotation.x+=0.01;
                        zfx.rotation.y+=0.01;
                        zfx2.rotation.x-=0.01;
                        zfx2.rotation.y-=0.01;
                    });
}
</script>
```
