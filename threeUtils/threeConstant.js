const sceneOption = ()=>{
    return {
        background:0xffffff,
        backgroundBlurriness:0,
        
    }
}

const renderOption = ()=>{
    return {
        antialias:true,   
        alpha:false
    }
}

const perspectiveCameraOption = ()=>{
    return {
        fov:45,
        aspect:1,
        near:0.1,
        far:1000,
        x:1,
        y:1,
        z:1,
    }
}

const orthographicCameraOption = ()=>{
    return {
        left:-60,
        right:60,
        top:60,
        bottom:-60,
        near:1,
        fa:70,
        x:1,
        y:1,
        z:1,
    }
}

const orbitControlsOption = ()=>{
    return {
        autoRotate:false,
        autoRotateSpeed:2.0,
        enableDamping:true,//开启阻尼效果
        enablePan:true,// 开启摄像机平移
        enableRotate:true,//开启摄像机水平或垂直 旋转
        minPolarAngle:0,//最小 垂直旋转角度
        maxPolarAngle:Math.PI,//最大 垂直旋转角度
        minDistance:0,//最小 向内移动多少
        maxDistance:Infinity,//最大 向外移动多少
        minAzimuthAngle:Infinity,//最小 水平旋转角度
        maxAzimuthAngle:Infinity,//最大 水平旋转角度
    }
}

/**
 * 轨道动画 配置
 * @param {String} moduleName 
 * @param {String} geometryName 物体实例名
 * @param {String} porpsName 物体实例的对应属性名
 * @param {Array} times 时间数组
 * @param {Array} values 轨道值
 * @returns 
 */
const keyframeTrackOption = (moduleName,geometryName='',porpsName='',times=[],values=[])=>{
    return {
        moduleName,
        name:`${geometryName}.${porpsName}`,
        times,
        values
    }
}

export {
    sceneOption,
    renderOption,
    perspectiveCameraOption,
    orthographicCameraOption,
    orbitControlsOption,
    keyframeTrackOption
}