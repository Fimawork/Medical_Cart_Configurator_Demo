import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import {CameraManager,UpdateCameraPosition,CameraDefaultPos, InputEvent,Camera_Inspector,ControlsTargetDefaultPos,SetDefaultCameraStatus,InstFBXLoader,InstGLTFLoader,FindMataterialByName,posData} from 'https://cdn.jsdelivr.net/gh/Fimawork/threejs_tools/fx_functions.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

//Outline
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

import {instrument_mount_list,column_list,base_list,caster_list,accessory_list} from './itemData.js';

let scene, camera, renderer, stats, mixer, clock;
let controls;
let threeContainer = document.getElementById("threeContainer");

const modelPosition=new THREE.Vector3(0,0,0);
const modelRotation=new THREE.Vector3(0,Math.PI, 0);
const modeScale=0.005;

let instrumentMount_index=0;//預設為固定支撐版(目前用不到)
let column_index=1;//預設為1.5/2inch可調高度圓管(目前用不到)

///使用來觸發底座與移動輪連動
let base_index=1;//預設為24吋底座
let caster_index=1;//預設為4吋移動輪


let mousePos = { x: undefined, y: undefined };
let hoverPos = { x: undefined, y: undefined };
let current_INTERSECTED=null;
let INTERSECTED=null;
//////Raycaster工具//////
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let _instrument_mount_content = document.querySelector('#instrument_mount_content');
let _column_content = document.querySelector('#column_content');
let _base_content = document.querySelector('#base_content');
let _caster_content = document.querySelector('#caster_content');
let _accessory_content = document.querySelector('#accessory_content');
let _dimension_content= document.querySelector('#dimension_content');

let _labelContainer = document.querySelector('#labelContainer');
let _ShowLabelToggle = document.querySelector('#ShowLabelToggle');
let _label_5 = document.querySelector('#label_5');//配件用Label，同時用來檢查是否成功鎖定SceneTarget

//配件編輯面板
let _SelectedItemController= document.querySelector('#SelectedItemController'); 
//系統訊息
let _system_info= document.querySelector('#system_info'); 
//Loading頁面
let _loading_canvas=document.getElementById('loading_canvas');

//移動輪規格欄位類型資訊
let caster_type="";


//caster煞車選配按鈕功能
let _casterToggleContainer=document.querySelector('#casterToggleContainer');
let _brake_toggle_1=document.querySelector('#brake_toggle_1');
let _brake_toggle_2=document.querySelector('#brake_toggle_2');
let _brake_toggle_3=document.querySelector('#brake_toggle_3');
let _brake_toggle_4=document.querySelector('#brake_toggle_4');
let _brake_toggle_5=document.querySelector('#brake_toggle_5');
//let _caster_toggle_06=document.getElementById('caster_toggle_06');

let current_accessory_list=[];
let isLabelOn=true;
//是否啟用鏡頭飛行模式，避免初始零件生成同時觸發飛行功能
let isCameraManagerOn=false;
//是否在配件位置編輯模式
let isSelectedItemControllerOn=false;
//是否在編輯移動輪模式
let isCasterFocus=false;

const maximum_height=1;
const minimum_height=-3.5;

let _item_01_btn = document.querySelector('#item_01_btn');
let _item_02_btn = document.querySelector('#item_02_btn');
let _item_03_btn = document.querySelector('#item_03_btn');
let _item_04_btn = document.querySelector('#item_04_btn');
let _item_05_btn = document.querySelector('#item_05_btn');
let _item_06_btn = document.querySelector('#item_06_btn');
let _item_07_btn = document.querySelector('#item_07_btn');
let _item_08_btn = document.querySelector('#item_08_btn');
let _item_09_btn = document.querySelector('#item_09_btn');
let _item_10_btn = document.querySelector('#item_10_btn');
let _item_11_btn = document.querySelector('#item_11_btn');
let _item_12_btn = document.querySelector('#item_12_btn');
let _item_13_btn = document.querySelector('#item_13_btn');
let _item_14_btn = document.querySelector('#item_14_btn');
let _item_15_btn = document.querySelector('#item_15_btn');
let _item_16_btn = document.querySelector('#item_16_btn');
let _item_17_btn = document.querySelector('#item_17_btn');
let _item_18_btn = document.querySelector('#item_18_btn');
let _item_19_btn = document.querySelector('#item_19_btn');
let _item_20_btn = document.querySelector('#item_20_btn');

let item_btn_list=[];

let isBreakModifyAvailable;

//煞車移動輪數量(預設為5個煞車)
let current_brake_num=5;

let current_instrument_mount=[];
let current_column=[];
let current_base=[];
let current_caster=[];
let current_accessories=[];

let cartDimension;
let cartBox;

let labelTarget_instrumentMount=new THREE.Object3D();
let labelTarget_column=new THREE.Object3D();
let labelTarget_base=new THREE.Object3D();
let labelTarget_caster=new THREE.Object3D();
let labelTarget_accessory=new THREE.Object3D();
let SelectedItemControllerTarget=new THREE.Object3D();


let targetPosition=null;

//outline
let selectedObjects = [];
let composer, effectFXAA, outlinePass;
const scale=2.5;//提高渲染解析度渲染後縮小顯示

const params = {
	edgeStrength: 3.0,
	edgeGlow: 1.5,
	edgeThickness: 3.6,
	pulsePeriod: 0,
	color:'#6bb4f7'
};




init();
animate();
EventListener();
//Camera_Inspector(camera,controls);



function init()
{
  scene = new THREE.Scene();
  //scene.background= new THREE.Color( 0xFFFFFF );
  camera = new THREE.PerspectiveCamera( 50, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000 );//非全螢幕比例設定
  renderer = new THREE.WebGLRenderer({ antialias: true });
  //renderer.setSize( threeContainer.clientWidth, threeContainer.clientHeight );//非全螢幕比例設定

  //提高渲染解析度渲染後縮小顯示
  renderer.setSize(threeContainer.clientWidth * scale, threeContainer.clientHeight * scale, false);

  renderer.setClearColor(0x000000, 0.0);//需加入這一條，否則看不到CSS的底圖
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.75;
  //document.body.appendChild( renderer.domElement );
  threeContainer.appendChild( renderer.domElement );

  const CameraDefaultPos=new THREE.Vector3(-4.848,5.501,-4.925);
  const ControlsTargetDefaultPos=new THREE.Vector3(-0.131,2.274,-0.023);
  camera.position.copy(CameraDefaultPos);
  posData[0]={ camera_pos:CameraDefaultPos, controlsTarget_pos:ControlsTargetDefaultPos};

  SelectedItemControllerTarget.position.set(0,20,0);
  scene.add(SelectedItemControllerTarget);

  //儀器支架
  posData[1]={ camera_pos:new THREE.Vector3(-0.244,5.351,-0.791), controlsTarget_pos:new THREE.Vector3(0.301,3.856,1.063)};
  //中柱
  posData[2]={ camera_pos:new THREE.Vector3(-4.642,3.297,2.753), controlsTarget_pos:new THREE.Vector3(0.570,2.752,-0.238)};
  //底座
  posData[3]={ camera_pos:new THREE.Vector3(-3.681,3.052,-1.480), controlsTarget_pos:new THREE.Vector3(0.014,0.174,-0.001)};
  //移動輪
  posData[4]={ camera_pos:new THREE.Vector3(0.494,3.414,-3.141), controlsTarget_pos:new THREE.Vector3(-0.090,0.533,-0.423)};
  
  //配件(增加配件時觸發)
  posData[5]={ camera_pos:new THREE.Vector3(-8.263,6.645,-7.018), controlsTarget_pos:new THREE.Vector3(0.380,3.145,0.451)};

  //推車背面(下載檔案時觸發)
  posData[6]={ camera_pos:new THREE.Vector3(5.219,5.358,5.276), controlsTarget_pos:new THREE.Vector3(0.073,1.928,0.010)};

  ///利用座標設定旋轉中心及鏡頭焦點，camera不須另外設定初始角度
  controls = new OrbitControls( camera, renderer.domElement );
  controls.enablePan = true;//右鍵平移效果
  controls.panSpeed = 0.4;
  controls.enableDamping = true;
  controls.dampingFactor =0.05;
  controls.maxDistance = 500;
  controls.target.copy( ControlsTargetDefaultPos );
  controls.zoomSpeed=0.5;
  controls.update();

  ///hdri 環境光源
  new RGBELoader()
					.setPath( 'textures/hdri/' )
					.load( 'studio_small_09_2k.hdr', function ( texture ) {

						texture.mapping = THREE.EquirectangularReflectionMapping;

						//scene.background = texture;
						scene.environment = texture;

	} );

  ///postprocessing
	composer = new EffectComposer( renderer );

	const renderPass = new RenderPass( scene, camera );
  renderPass.clearAlpha=0;
	composer.addPass( renderPass );

	outlinePass = new OutlinePass( new THREE.Vector2( threeContainer.clientWidth, threeContainer.clientHeight ), scene, camera );
	composer.addPass( outlinePass );

	const outputPass = new OutputPass();
	composer.addPass( outputPass );

	effectFXAA = new ShaderPass( FXAAShader );
	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / threeContainer.clientWidth, 1 / threeContainer.clientHeight );
	composer.addPass( effectFXAA );

  outlinePass.edgeStrength = params.edgeStrength;
  outlinePass.edgeGlow= params.edgeGlow;
	outlinePass.edgeThickness= params.edgeThickness;
  outlinePass.visibleEdgeColor.set(params.color);

  ///紀錄相機的初始位置
	SetDefaultCameraStatus(CameraDefaultPos,ControlsTargetDefaultPos);

  //LabelTarget
  labelTarget_instrumentMount.position.set(0,4.6241445,0);
  labelTarget_column.position.set(-0.07, 2.5,0);
  labelTarget_base.position.set(0.1283865274999999,0.325,0.000013582500000053344);
  labelTarget_caster.position.set(0.0705078549999999,0.012500000000000011, -0.18730758749999998);
  labelTarget_accessory.position.set(1.7,3,0);
  scene.add(labelTarget_instrumentMount).add(labelTarget_column).add(labelTarget_base).add(labelTarget_caster).add(labelTarget_accessory);

  ///主要物件
	const defaultScenes = 
  [
    () => new Promise((resolve) => setTimeout(() => { _loading_canvas.style.display="flex"; resolve(); }, 10)),//Loading頁面
    () => new Promise((resolve) => setTimeout(() => { _labelContainer.style.cssText = "opacity: 0;"; resolve(); }, 50)),//隱藏SceneLabel避免初始化完成前誤觸
		() => new Promise((resolve) => setTimeout(() => { BaseManager(1); resolve(); }, 100)),//底座&移動輪
    () => new Promise((resolve) => setTimeout(() => { InstrumentMountManager(0); resolve(); }, 110)),//儀器支撐版
    () => new Promise((resolve) => setTimeout(() => { ColumnManager(1); resolve(); }, 120)),//中柱
    
    () => new Promise((resolve) => setTimeout(() => { SetupItemImage(); resolve(); }, 200)),//設定Item的圖片
    () => new Promise((resolve) => setTimeout(() => { SetupBtnList(); resolve(); }, 400)),//設定Item案例群組 
    
    () => new Promise((resolve) => setTimeout(() => { isCameraManagerOn=true; DefaultRaycast();resolve(); }, 500)),//啟用攝影機飛行功能//重置Raycast狀態
    () => new Promise((resolve) => setTimeout(() => { SetupLabelTarget(); resolve(); }, 750)),//LabelTarget
    () => new Promise((resolve) => setTimeout(() => { _loading_canvas.style.display="none"; resolve(); }, 900)),//關閉Loading頁面
    () => new Promise((resolve) => setTimeout(() => { _labelContainer.style.cssText = "opacity: 1;"; resolve(); }, 1000)),//顯示SceneLabel   
    () => new Promise((resolve) => setTimeout(() => { CheckIfSceneLabelSetupCorrectly(); resolve(); }, 1500)),//確認SceneLabel是否成功鎖定到LabelTarget     
	];

	async function SetupDefaultScene() 
  {
		for (const task of defaultScenes) 
    {
			await task(); // 確保每個任務依次完成
		}
		
    console.log('All scenes loaded');
	}

	SetupDefaultScene();

  function CheckIfSceneLabelSetupCorrectly()
  {
    if (parseInt(_label_5.style.left)<3&&parseInt(_label_5.style.top)<3)//若鎖定到LabelTarget則重新生成物件
    {
      SetupDefaultScene();
    } 

    else
    {
      console.log('SceneLabel Setup Correctly');
    }
  }


  //依初始零件位置放置SceneLabelTarget 
  const LabelTargets = 
  [
    () => new Promise((resolve) => setTimeout(() => { SetupSenceTag("label label_fadeIn_anim","EditMode",1,_labelContainer);resolve(); }, 100)),

    () => new Promise((resolve) => setTimeout(() => { SetupSenceTag("label label_fadeIn_anim","EditMode",2,_labelContainer);resolve(); }, 200)),

    () => new Promise((resolve) => setTimeout(() => { SetupSenceTag("label label_fadeIn_anim","EditMode",3,_labelContainer);resolve(); }, 300)),

    () => new Promise((resolve) => setTimeout(() => { SetupSenceTag("label label_fadeIn_anim","EditMode",4,_labelContainer);resolve(); }, 400)),

    () => new Promise((resolve) => setTimeout(() => { UpdateSceneLabel();resolve(); }, 500)),//Label追蹤3D物件
  ];

  function UpdateSceneLabel()
  {
    requestAnimationFrame( UpdateSceneLabel );
    
    SceneTag(labelTarget_instrumentMount,document.querySelector('#label_1'),new THREE.Vector2(-5,-2.5),camera);  
    SceneTag(labelTarget_column,document.querySelector('#label_2'),new THREE.Vector2(2,-2.5),camera);  
    SceneTag(labelTarget_base,document.querySelector('#label_3'),new THREE.Vector2(-10,-10),camera);  
    SceneTag(labelTarget_caster,document.querySelector('#label_4'),new THREE.Vector2(10,0),camera); 
    SceneTag(labelTarget_accessory,document.querySelector('#label_5'),new THREE.Vector2(0,0),camera); 
  }

  async function SetupLabelTarget()//綁定預設物件
  {
    for (const task of LabelTargets) 
    {
    	await task(); // 確保每個任務依次完成
    }
    
    console.log('All LabelTarget loaded');
  }
  
 

  ///EventListener
  window.addEventListener( 'resize', onWindowResize );  
  window.addEventListener("pointerdown", (event) => {
    InputEvent();
     mousePos = { x: event.clientX, y: event.clientY };
		onPointerMove(event);//改以點擊作為Raycast判斷的時間點，改善觸控螢幕誤判狀況
  });
  window.addEventListener("wheel", (event) => {InputEvent();});

}

function SetupItemImage()
{
  _item_01_btn.style.backgroundImage = `url('${instrument_mount_list[0].item_img}')`;
  _item_02_btn.style.backgroundImage = `url('${instrument_mount_list[1].item_img}')`;
  _item_03_btn.style.backgroundImage = `url('${instrument_mount_list[2].item_img}')`;

  _item_04_btn.style.backgroundImage = `url('${column_list[0].item_img}')`;
  _item_05_btn.style.backgroundImage = `url('${column_list[1].item_img}')`;
  _item_06_btn.style.backgroundImage = `url('${column_list[2].item_img}')`;

  _item_07_btn.style.backgroundImage = `url('${base_list[0].item_img}')`;
  _item_08_btn.style.backgroundImage = `url('${base_list[1].item_img}')`;
  _item_09_btn.style.backgroundImage = `url('${base_list[2].item_img}')`;

  _item_10_btn.style.backgroundImage = `url('${caster_list[0][0].item_img}')`;
  _item_11_btn.style.backgroundImage = `url('${caster_list[1][0].item_img}')`;
  _item_12_btn.style.backgroundImage = `url('${caster_list[2][0].item_img}')`;

  _item_13_btn.style.backgroundImage = `url('${accessory_list[0].item_img}')`;
  _item_14_btn.style.backgroundImage = `url('${accessory_list[1].item_img}')`;
  _item_15_btn.style.backgroundImage = `url('${accessory_list[2].item_img}')`;
  _item_16_btn.style.backgroundImage = `url('${accessory_list[3].item_img}')`;
  _item_17_btn.style.backgroundImage = `url('${accessory_list[4].item_img}')`;
  _item_18_btn.style.backgroundImage = `url('${accessory_list[5].item_img}')`;
  _item_19_btn.style.backgroundImage = `url('${accessory_list[6].item_img}')`;
  _item_20_btn.style.backgroundImage = `url('${accessory_list[7].item_img}')`;
}

function onWindowResize() 
{
    camera.aspect = threeContainer.clientWidth/threeContainer.clientHeight;//非全螢幕比例設定
		camera.updateProjectionMatrix();
    renderer.setSize( threeContainer.clientWidth* scale, threeContainer.clientHeight* scale, false );

    composer.setSize( threeContainer.clientWidth* scale, threeContainer.clientHeight* scale, false );

		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / threeContainer.clientWidth, 1 / threeContainer.clientHeight );
}

function animate() 
{
  requestAnimationFrame( animate );
  
  controls.update();
  //renderer.render( scene, camera );
  composer.render();//使用postprocessing替代

  if(isCameraManagerOn)
  {
    UpdateCameraPosition(camera,controls);
    RaycastFunction();
  }

  if(isCasterFocus)//如果在編輯移動輪狀態，依據操作更新break_toggle位置
    {
      SetupCasterBrakePanelOn();
    }
}

function EventListener()
{
  window.addEventListener("keydown",function (event) {

      switch (event.code) 
      {

        case "Space":
        //MoveModelOFF();
        //_caster_toggle_01.checked=false;

        break;

        case "ArrowDown":

       //console.log(scene);

       //_caster_toggle_01.checked=true;

        break;

        case "ArrowUp":
        
        //EditMode(1);

        
        break;

        case "ArrowLeft":

        break;

        case "ArrowRight":

        break;
      }
      
  });

  ///滑鼠點擊accessory可啟用模型移動面板
  window.addEventListener("pointerdown", function(e) {
    if(INTERSECTED!=null&&!isSelectedItemControllerOn)//在零件位置編輯狀態時禁用，必免誤觸
    {
      if(!isMobile())//行動裝置上不支援
      {
        if(INTERSECTED.name.includes("Panel"))
        {
          if(current_INTERSECTED==null)//避免A物件編輯時，點選到B物件
          {
            EditMode(1);
          }
        }

        if(INTERSECTED.name.includes("Tube"))
        {
          if(current_INTERSECTED==null)//避免A物件編輯時，點選到B物件
          {
            EditMode(2);
          }
        }

        if(INTERSECTED.name==="20Base"||INTERSECTED.name==="24Base"||INTERSECTED.name==="4LegBase")
        {
          if(current_INTERSECTED==null)//避免A物件編輯時，點選到B物件
          {
            EditMode(3);
          }
        }

        if(INTERSECTED.name.includes("Caster")&& !isCasterFocus)//編輯移動輪狀態不觸發
        {
          if(current_INTERSECTED==null)//避免A物件編輯時，點選到B物件
          {
            EditMode(4);
          }
        }
      }
      
      if(INTERSECTED.name.includes("accessory"))
      {
        if(current_INTERSECTED==null)//避免A物件編輯時，點選到B物件
        {
          MoveModelON(INTERSECTED);
          addSelectedObject(INTERSECTED);
        }     
      }

      if(isCasterFocus)//如果在編輯移動輪狀態，依據操作更新break_toggle位置
      {
        SetupCasterBrakePanelOn();
      }
    }
  });


  window.addEventListener( 'pointermove', function(e) {
  //  if(isCasterFocus)//如果在編輯移動輪狀態，依據操作更新break_toggle位置
  //  {
  //    SetupCasterBrakePanelOn();
  //  }
  });
}

function isMobile()//偵測是否為行動裝置
{
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function InstantiatModel(scene_name,src,postprocessing_layer,delay)
{
  if(scene.getObjectByName(scene_name)==null)//
  {
    InstGLTFLoader(src,modelPosition,modelRotation,modeScale,scene_name,null, scene);
    
    //指定新outline指定物件，並hightlight該物件
    setTimeout(() => {postprocessing_layer.push(scene.getObjectByName(scene_name));addSelectedObject(scene.getObjectByName(scene_name));}, delay*1000);//1000=1sec}
  }
}


function InstrumentMountManager(i)//儀器支撐板設定 
{
  current_instrument_mount=[];//移除原outline指定物件

  instrumentMount_index=i

  ResetInstrumentModule();//重置儀器支架

  if(isCameraManagerOn)CameraManager(1);
  
  InstantiatModel(instrument_mount_list[i].scene_name,instrument_mount_list[i].src,current_instrument_mount,0.5);

  UpdateSpecContent( _instrument_mount_content,instrument_mount_list[i].spec_name);

}

function ColumnManager(i)
{
  current_column=[];//移除原outline指定物件

  column_index=i;

  ResetColumnModule()//重置中柱

  if(isCameraManagerOn)CameraManager(2);

  InstantiatModel(column_list[i].scene_name,column_list[i].src,current_column,0.5);

  UpdateSpecContent( _column_content,column_list[i].spec_name);
}

function BaseManager(i)//底座設定功能, 變數名稱 20Base/24Base/4LegBase
{
  current_base=[];//移除原outline指定物件

  base_index=i;

  ResetBaseModule();//重置底座

  DefaultCasterToggle();//還原為預設移動輪煞車狀態(全部含煞車)

  if(isCameraManagerOn)CameraManager(3);

  InstantiatModel(base_list[i].scene_name,base_list[i].src,current_base,0.5);
  
  CasterManager(caster_index);//更新移動輪

  UpdateSpecContent(_base_content,base_list[i].spec_name);

  setTimeout(() => {CountBrakeNum();}, 1000);//1000=1sec}
}


function CasterManager(i)//移動輪設定功能
{
  current_caster=[];//移除原outline指定物件

  ResetCasterModule();//刪除目前場景上的移動輪

  DefaultCasterToggle();//還原為預設移動輪煞車狀態(全部含煞車)

  caster_index=i;

  if(isCameraManagerOn)CameraManager(4);
      
  InstantiatModel(caster_list[i][base_index].scene_name,caster_list[i][base_index].src,current_caster,1);

  //更新移動輪規格欄位
  caster_type=caster_list[i][base_index].spec_name;

  if(isBreakModifyAvailable)//初始化時不顯示此面板
  {
    setTimeout(() => {SetupCasterBrakePanelOn();}, 600);//開啟移動輪編輯面板
  }
  
  setTimeout(() => {CountBrakeNum();isBreakModifyAvailable=true;}, 1000);//1000=1sec}
}

function AccessoryManager(i)
{
  let instantiate_item_hight=2;

  MoveModelOFF();//重置模型移動面板

  CameraManager(5);

//InstGLTFLoader(accessory_list[i].src,new THREE.Vector3(modelPosition.x,modelPosition.y+instantiate_item_hight,modelPosition.z),modelRotation,modeScale,accessory_list[i].//scene_name,null,scene);

  InstGLTFLoaderForAccessory(accessory_list[i].src,new THREE.Vector3(modelPosition.x,modelPosition.y+instantiate_item_hight,modelPosition.z),modelRotation,modeScale,accessory_list[i].scene_name);

//  //指定新outline指定物件
//  setTimeout(() => {current_accessories.push(scene.getObjectByName(accessory_list[i].scene_name));}, 500);//1000=1sec}
   
  //啟用模型移動面板
  setTimeout(() => {InstMoveModelPanel();}, 600);//1000=1sec}
}

function ResetInstrumentModule()//重置儀器支架
{
  for(let i=0;i<instrument_mount_list.length;i++)
  {
    DestroyObject(scene.getObjectByName(instrument_mount_list[i].scene_name));
  }
}

function ResetColumnModule()//重置中柱
{
  for(let i=0;i<column_list.length;i++)
  {
    DestroyObject(scene.getObjectByName(column_list[i].scene_name));
  }
}

function ResetBaseModule()//重置底座
{
  for(let i=0;i<base_list.length;i++)
  {
    DestroyObject(scene.getObjectByName(base_list[i].scene_name));
  }
}

function ResetCasterModule()//重置移動輪
{
  for(let i=0;i<caster_list.length;i++)
  {
    for(let j=0;j<caster_list[i].length;j++)
    {
      DestroyObject(scene.getObjectByName(caster_list[i][j].scene_name));
    }
  }
}

function DestroyObject(target)
{
  if(target!=null)
  {
    scene.remove(target);
  }
}

//////Raycaster工具//////
function onPointerMove( event ) 
{
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;	
}

function RaycastFunction()
{
	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );
		
	const intersects = raycaster.intersectObjects( scene.children);
		
	if ( intersects.length > 0 ) 
	{
		if ( INTERSECTED != intersects[ 0 ].object ) 
		{
			INTERSECTED = intersects[ 0 ].object;
			
      INTERSECTED.traverseAncestors( function ( object ) {

        if (object.parent===scene) 
        //往父層回推，將INTERSECTED重新指定為在scene底下第一層的type為Object3D的物件	
        {
          INTERSECTED=object;
        }
			
      } );
		}
	} 

	else 
	{
		INTERSECTED = null;
	}
}

function DefaultRaycast()
{
  pointer.set(1000,1000);//設置在畫面外(避免行動裝置介面上停留下在上一個點選物件)
  INTERSECTED = null;
  current_INTERSECTED = null;
}

//棄用
function InstantiateLabelTarget(thisLabelTarget,targetObject)
{
  const box = new THREE.Box3().setFromObject(targetObject); // 創建包圍盒
  const center = new THREE.Vector3();
  box.getCenter(center); // 計算中心點

  thisLabelTarget.position.copy(center);
  scene.add(thisLabelTarget);
}

function SetupSenceTag(ccsStyle,thisEvent,index,thisSceneTagHolder)
{
  let thisSceneTag = document.createElement("div");
	thisSceneTag.setAttribute("id", `label_${index}`);
	thisSceneTag.setAttribute("class", ccsStyle);
  thisSceneTag.textContent=`${index}`;
	thisSceneTag.setAttribute("onclick", thisEvent+`(${index})`);
  
	thisSceneTagHolder.append(thisSceneTag);
}

function EditMode(i) //編輯模式 0:default , 1:儀器支架 2:中柱 3:底座 4:移動輪 5:配件
{

  //重置所有Raycast狀態
  DefaultRaycast();
  
  switch(i)
  {
    case 0:

    CameraManager(0);

    FilterItems(0);//還原篩選狀態

    MoveModelOFF();//關閉配件操作面板

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 1:

    CameraManager(1);

    for(let i=0;i<current_instrument_mount.length;i++)
    {
      addSelectedObject(current_instrument_mount[i]);
    }

    FilterItems(1);

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 2:

    CameraManager(2);

    for(let i=0;i<current_column.length;i++)
    {
      addSelectedObject(current_column[i]);
    }

    FilterItems(2);

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 3:

    CameraManager(3);

    for(let i=0;i<current_base.length;i++)
    {
      addSelectedObject(current_base[i]);
    }

    FilterItems(3);

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 4:

    CameraManager(4);

    for(let i=0;i<current_caster.length;i++)
    {
      addSelectedObject(current_caster[i]);
    }

    FilterItems(4);

    CountBrakeNum();

    setTimeout(() => {SetupCasterBrakePanelOn();}, 600);//開啟移動輪編輯面板

    break;

    case 5:

    FilterItems(5);

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;
  }
  
}


///Outline效果&重置尺寸
function addSelectedObject( object ) 
{
  try 
  {
    selectedObjects = [];
    selectedObjects.push( object );
    setTimeout(() => {outlinePass.selectedObjects = selectedObjects;}, 200);//1000=1sec}//oultine效果開始
    setTimeout(() => {outlinePass.selectedObjects = [];}, 1500);//1000=1sec}//oultine效果結束
      
    //量測推車尺寸
    setTimeout(() => {MeasureCartDimension();}, 1600);//1000=1sec} 
  }

  catch (error) 
  {
    console.log(`發生錯誤.${error}`);
  }
}

function SceneTag(target,lable,offset,targetCam)  
{
  try 
  {
    var width = threeContainer.clientWidth, height = threeContainer.clientHeight;
    var widthHalf = width / 2, heightHalf = height / 2;
    const worldPosition = new THREE.Vector3();
    target.getWorldPosition(worldPosition);
    var pos_3D = worldPosition.clone()
    //var pos_3D = _target.position.clone();///object.position 取得的是相對座標（即該物體相對於其父物體的座標），而不是世界座標。

    pos_3D.project(targetCam);
    pos_3D.x = ( pos_3D.x * widthHalf ) + widthHalf;
    pos_3D.y = - ( pos_3D.y * heightHalf ) + heightHalf;

    lable.style.cssText = `position:absolute;top:${pos_3D.y/height*100+offset.y}%;left:${pos_3D.x/width*100+offset.x}%;`;
  }

  catch (error) 
  {
    console.log(`發生錯誤.${error}`);
  }
}

function ShowSceneLabelToggle()
{
  if(!isLabelOn)
  {
    _labelContainer.style.display="block";
    _ShowLabelToggle.style.cssText = "color: #6bb4f7;";
    isLabelOn=true;
  }

  else
  {
    _labelContainer.style.display="none";
    _ShowLabelToggle.style.cssText = "color: rgba(0, 0, 0, 0.45);";
    isLabelOn=false;
  }
}

function SetupBtnList()
{
  item_btn_list.push(_item_01_btn);//Fixed Angle Panel
  item_btn_list.push(_item_02_btn);//Fixed Angle with Slide Panel
  item_btn_list.push(_item_03_btn);//Angle Adjustable with Slide Panel
  item_btn_list.push(_item_04_btn);//1.5"/2" Height Adjustable Tube
  item_btn_list.push(_item_05_btn);//1.25"/1.5" Height Adjustable Tube
  item_btn_list.push(_item_06_btn);//1.5" Stainless Steel Tube
  item_btn_list.push(_item_07_btn);//20" Base
  item_btn_list.push(_item_08_btn);//24" Base
  item_btn_list.push(_item_09_btn);//4 Leg Base
  item_btn_list.push(_item_10_btn);//4" Medical Caster
  item_btn_list.push(_item_11_btn);//4" Twin-Caster
  item_btn_list.push(_item_12_btn);//3" Twin-Caster
  item_btn_list.push(_item_13_btn);//Basket
  item_btn_list.push(_item_14_btn);//Adapter Holder
  item_btn_list.push(_item_15_btn);//Barcode Scanner Holder
  item_btn_list.push(_item_16_btn);//Cable Management Holder
  item_btn_list.push(_item_17_btn);//Tray
  item_btn_list.push(_item_18_btn);//Handle
  item_btn_list.push(_item_19_btn);//Drawer
  item_btn_list.push(_item_20_btn);//Printer Holder
}

function FilterItems(type_index) //編輯模式 0:default , 1:儀器支架 2:中柱 3:底座 4:移動輪 5:配件
{
  switch(type_index)
  {
    case 0:

    for(let i=0;i<item_btn_list.length;i++)
    {
      item_btn_list[i].style.display="flex";
    }

    break;

    case 1:

    for(let i=0;i<item_btn_list.length;i++)
    {
      if(i<=2)
      {
        item_btn_list[i].style.display="flex";
      }

      else
      {
        item_btn_list[i].style.display="none";
      }
    }

    break;

    case 2:

    for(let i=0;i<item_btn_list.length;i++)
    {
      if(i<=2)
      {
        item_btn_list[i].style.display="none";
      }

      else if(i<=5)
      {
        item_btn_list[i].style.display="flex";
      }

      else
      {
        item_btn_list[i].style.display="none";
      }
    }

    break;

    case 3:

    for(let i=0;i<item_btn_list.length;i++)
    {
      if(i<=5)
      {
        item_btn_list[i].style.display="none";
      }

      else if(i<=8)
      {
        item_btn_list[i].style.display="flex";
      }

      else
      {
        item_btn_list[i].style.display="none";
      }
    }

    break;

    case 4:

    for(let i=0;i<item_btn_list.length;i++)
    {
      if(i<=8)
      {
        item_btn_list[i].style.display="none";
      }

      else if(i<=11)
      {
        item_btn_list[i].style.display="flex";
      }

      else
      {
        item_btn_list[i].style.display="none";
      }
    }

    break;

    case 5:

    for(let i=0;i<item_btn_list.length;i++)
    {
      if(i<=11)
      {
        item_btn_list[i].style.display="none";
      }

      else
      {
        item_btn_list[i].style.display="flex";
      }
    }

    break;
  }
   
}


function MeasureCartDimension()
{
  cartBox= new THREE.Box3().setFromObject(scene);
  cartDimension= new THREE.Vector3();
  cartBox.getSize(cartDimension);
  
  //console.log(cartDimension);

  //4.986644500000001-->996.5(高度對照)

  const scale=996.5/4.9866445;
  _dimension_content.textContent=`W ${Math.round(cartDimension.x*scale)}mm x D ${Math.round(cartDimension.z*scale)}mm x H ${Math.round(cartDimension.y*scale)}mm`;
}

function MoveModel(action)
{
  try 
	{
    if(current_INTERSECTED!=null)
    {
      if(action==="UP")
      {
        current_INTERSECTED.position.y+=0.5;
      }

      if(action==="DOWN")
      {
        current_INTERSECTED.position.y-=0.5;
      }

      if(action==="RIGHT")
      {
        current_INTERSECTED.rotation.y+=Math.PI*0.5;
      }

      if(action==="LEFT")
      {
        current_INTERSECTED.rotation.y-=Math.PI*0.5;
      }

      UpdateMoveModelPanelPos(current_INTERSECTED);//更新控制面板位置 
    }
  }

  catch (error) 
	{
		console.log(`發生錯誤.${error}`);
	}

  finally 
  {
    if(current_INTERSECTED==null)
    {
      current_INTERSECTED=FindLatestAccessory();//如果未指向目標物件，則重新以指向高於推車那一個零件
    }
  }

}

function MoveModelON(target)
{ 
  try 
	{
    current_INTERSECTED=target;
    setTimeout(() => {UpdateMoveModelPanelPos(current_INTERSECTED);}, 150);//1000=1sec} //更新控制面板位置 

    if(isLabelOn)//移動零件時不顯示Label
    {
      ShowSceneLabelToggle();
    }
  }

  catch (error) 
	{
		console.log(`發生錯誤.${error}`);
	}

  finally 
  {
    current_INTERSECTED=target;
  }
}

function MoveModelOFF()
{
  if(current_INTERSECTED!=null&&current_INTERSECTED.position.y>=1)
  {
    scene.remove(current_INTERSECTED);

    //提示面板
    ShowErrorDialog();
  }

  if(current_INTERSECTED!=null&&current_INTERSECTED.position.y<=-3.5)
  {
    scene.remove(current_INTERSECTED);

    //提示面板
    ShowErrorDialog();
  }
  
  setTimeout(() => {current_INTERSECTED=null;}, 100);//1000=1sec}
  
  _SelectedItemController.style.display="none";

  if(!isLabelOn)
  {
    ShowSceneLabelToggle();
  }

  //更新配件規格欄位
  UpdateAccessorySpecification();

  //量測推車尺寸
  MeasureCartDimension();

  //刪除不合理物件
  DeleteunreasonableItem();

  //回復預設視角
  CameraManager(0);

  isSelectedItemControllerOn=false;

  //重置Raycast狀態
  DefaultRaycast();
}

function UpdateMoveModelPanelPos(target)  
{
  let center= new THREE.Vector3();

  try 
	{
    isSelectedItemControllerOn=true;

    const box= new THREE.Box3().setFromObject(target);
    box.getCenter(center);

    var width = threeContainer.clientWidth, height = threeContainer.clientHeight;
    var widthHalf = width / 2, heightHalf = height / 2;

    center.project(camera);
    center.x = ( center.x * widthHalf ) + widthHalf;
    center.y = - ( (center.y) * heightHalf ) + heightHalf;
      
    if(center!=null)
    {
      _SelectedItemController.style.cssText = `position:absolute;top:${center.y/height*100}%;left:${center.x/width*100}%;display:block;`;
    }
    
    else
    {
      _SelectedItemController.style.cssText = `position:absolute;top:24.65%;left:47.5%;display:block;`;
    }
  }

  catch (error) 
	{
		console.log(`發生錯誤.${error}`);
	}

  finally 
  {
    if(center!=null)
    {
      _SelectedItemController.style.cssText = `position:absolute;top:${center.y/height*100}%;left:${center.x/width*100}%;display:block;`;
    }

    else
    {
      UpdateMoveModelPanelPos(FindLatestAccessory());
    }
  }
}

function InstMoveModelPanel()
{
  try
  {
    _SelectedItemController.style.cssText = `position:absolute;top:24.65%;left:47.5%;display:block;`;
    //current_INTERSECTED=FindLatestAccessory();
  }

  catch (error) 
	{
		console.log(`發生錯誤.${error}`);
	}

  //finally
  //{
  //  current_INTERSECTED=FindLatestAccessory();
  //}
  
}

function DeleteAccessory()
{
  try
  {
    if(current_INTERSECTED!=null)
    {
      scene.remove(current_INTERSECTED);
    }

    if(current_INTERSECTED==null)
    {
      //scene.remove(FindLatestAccessory());
      DeleteunreasonableItem();
    }

    _SelectedItemController.style.display="none";

    if(!isLabelOn)
    {
      ShowSceneLabelToggle();
    }

    //量測推車尺寸
    MeasureCartDimension();

    //更新配件規格欄位
    UpdateAccessorySpecification();

    //重置Raycast狀態
    DefaultRaycast();

    isSelectedItemControllerOn=false;
  }

  catch (error) 
	{
		console.log(`發生錯誤.${error}`);
	}

  finally
  {
    _SelectedItemController.style.display="none";
  }
}

function UpdateAccessorySpecification()
{
  current_accessory_list=[];

  for(let i=0;i<scene.children.length;i++)
  {
    current_accessory_list.push(SetAccessoryName(scene.children[i]));
  }

  const uniqueItem = [...new Set(current_accessory_list)];//不顯示重複字元

  //_accessory_content.textContent=uniqueItem;

  const revisiedUniqueItem=uniqueItem.slice(1);//移除多餘的第一個字元(,符號)

  UpdateSpecContent(_accessory_content,revisiedUniqueItem);
}

function SetAccessoryName(target)
{
  for(let i=0;i<accessory_list.length;i++)
  {
    if(target.name.includes(accessory_list[i].scene_name))
    {
      return accessory_list[i].spec_name;
    }
  }
}

function UpdateSpecContent(targetCSS,newContent)
{
  targetCSS.textContent=newContent;
  targetCSS.style.cssText = "color: #6bb4f7;";

  setTimeout(() => { targetCSS.style.cssText= "color: rgba(0, 0, 0, 0.9);";}, 1000);//1000=1sec}
}

function DeleteunreasonableItem()
{
  for(let i=0;i<scene.children.length;i++)
  {
    if(scene.children[i].name.includes("accessory_"))
    {
      if(scene.children[i].position.y>=maximum_height)
      {
        scene.remove(scene.children[i]);
      }

      if(scene.children[i].position.y<=minimum_height)
      {
        scene.remove(scene.children[i]);
      }
    }
  }
}

function FindLatestAccessory()
{
  for(let i=0;i<scene.children.length;i++)
  {
    if(scene.children[i].name.includes("accessory_"))
    {
      if(scene.children[i].position.y>=maximum_height)
      {
        return scene.children[i];
      }
    }
  }
}

async function TakeScreenshot() 
{
  let threeImageData_01,threeImageData_02,worldTime;

  //載入背景圖
 const backgroundImage = document.getElementById('backgroundImage');
 const _backgroundImage = await html2canvas(backgroundImage, {
   backgroundColor: null, // null保持透明,false不透明
   useCORS: true,
   scale: 2.5
 });

  //載入玻璃面板
 const frozenGlassPanel = document.getElementById('frozenGlassPanel');
 const _frozenGlassPanel = await html2canvas(frozenGlassPanel, {
   backgroundColor: false, // null保持透明,false不透明
   useCORS: true,
   scale: 2.5
 });

 //使用 html2canvas 渲染 UI（不包含 WebGL canvas）
  const specificationTable = document.getElementById('grid-table');
  const _specificationTable = await html2canvas(specificationTable, {
    backgroundColor: null, // null保持透明,false不透明
    useCORS: true,
    scale: 3
  });

  //主標題
  const MainTitle = document.getElementById('main_title');
  const _MainTitle = await html2canvas(MainTitle, {
   backgroundColor: null, // null保持透明,false不透明
   useCORS: true,
   scale: 2.5
  });

  //副標題
  const SubTitle = document.getElementById('sub_title');
  const _SubTitle = await html2canvas(SubTitle, {
   backgroundColor: null, // null保持透明,false不透明
   useCORS: true,
   scale: 2.5
  });

  setTimeout(() => {_loading_canvas.style.display="flex";CameraManager(0);}, 100);//1000=1sec}//開啟LoadingPage，回預設鏡頭位置
  setTimeout(() => { firstShot();}, 750);//1000=1sec}
  setTimeout(() => {CameraManager(6);}, 1000);//1000=1sec}鏡頭轉向推車背面
  setTimeout(() => { SecondShot();}, 2000);//1000=1sec}
  setTimeout(() => { SetupTimeData();}, 2500);//1000=1sec}
  setTimeout(() => { DrawTheImage();}, 3000);//1000=1sec}
  setTimeout(() => { CameraManager(0);}, 4000);//1000=1sec}下載結束鏡頭歸位
  setTimeout(() => { _loading_canvas.style.display="none";}, 5000);//1000=1sec}//隱藏LoadingPage

 function firstShot()//取得 Three.js 第一張畫面為圖片
 {
    composer.render(); // 如果你有使用 postprocessing  
    threeImageData_01 = renderer.domElement.toDataURL('image/png');
 }

 function SecondShot()//取得 Three.js 第二張畫面為圖片
 {
    composer.render(); // 如果你有使用 postprocessing
    threeImageData_02 = renderer.domElement.toDataURL('image/png');
 }

 function SetupTimeData()
 {
    var today = new Date();
	  var dateNow = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
	  var timeNow = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	  worldTime = dateNow+' '+timeNow;
 }
 
 function DrawTheImage()
 {
    // Step 4: 建立新 canvas 合成兩層圖像
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = renderer.domElement.width;
    finalCanvas.height = renderer.domElement.height;
    const ctx = finalCanvas.getContext('2d');

    // Step 5: 先畫上 Three.js 圖像
    const threeImg_01 = new Image();
    const threeImg_02 = new Image();

    threeImg_01.onload = () => {
      ctx.drawImage(_backgroundImage, 0, 0);
      //ctx.drawImage(_frozenGlassPanel , 0, 0);
      
      ctx.drawImage(threeImg_01, 100, 0);
      ctx.drawImage(threeImg_02, 1100, 0);

      // Step 6: 再畫上 UI 圖像（透明背景）
      ctx.drawImage(_specificationTable, 150, 630);

      ctx.drawImage(_MainTitle, 150, 250);
      ctx.drawImage(_SubTitle, 150, 350);
      

      // Step 7: 將合成後的圖像轉為下載
      const link = document.createElement('a');
      link.href = finalCanvas.toDataURL('image/png');
      link.download = `MedicalCartSpec_${worldTime}.png`;
      link.click();
    };
    
    threeImg_01.src = threeImageData_01;
    threeImg_02.src = threeImageData_02;
 }

}

function ShowErrorDialog()
{
  setTimeout(() => {_system_info.style.display="block";}, 500);//1000=1sec}
  setTimeout(() => { _system_info.style.display="none";}, 2220);//1000=1sec}
}

function SetupCasterBrakePanelOn()
{
  isCasterFocus=true;
  _casterToggleContainer.style.display="block";

  let i=0;//console.log(current_caster[0].children[0]);
  let label="";
  let toggle="";

  if(current_caster[0]!=null)
  {
    current_caster[0].children[0].traverse( function ( object ) {

			if ( object.name.includes("Break"))
			{
        i++;
        //object.visible=false;
        label=document.querySelector(`#caster_toggle_label_${i}`);
        toggle=document.querySelector(`#brake_toggle_${i}`);
        ShowCasterLabel(label,object);  
        label.style.display="block";

        object.visible=toggle.checked;
			}
    });
  }
}

function SetupCasterBrakePanelOFF()
{
  isCasterFocus=false;
  _casterToggleContainer.style.display="none";

  for(let i=0;i<_casterToggleContainer.children.length;i++)
  {
    _casterToggleContainer.children[i].style.display="none";
  }

  CountBrakeNum();

  //重置所有Raycast狀態
  DefaultRaycast();
}

function CountBrakeNum()
{
  current_brake_num=0;//重置數量
  //更新目前煞車移動輪的數量

  if(current_caster[0]!=null)
  {
    current_caster[0].children[0].traverse( function ( object ) {

	  	if ( object.name.includes("Break")&&object.visible)
	  	{
        current_brake_num++;
	  	}

    });
  }

  //更新移動輪規格欄位
  UpdateSpecContent(_caster_content,caster_type+`(${current_brake_num}pcs with brakes)`);
}

function ShowCasterLabel(cssLabel,target)  
{  
  try 
	{
    let center= new THREE.Vector3();
    const box= new THREE.Box3().setFromObject(target);
    box.getCenter(center);

    var width = threeContainer.clientWidth, height = threeContainer.clientHeight;
    var widthHalf = width / 2, heightHalf = height / 2;

    
    center.project(camera);
    center.x = ( center.x * widthHalf ) + widthHalf;
    center.y = - ( (center.y) * heightHalf ) + heightHalf;
      
    cssLabel.style.cssText = `position:absolute;top:${center.y/height*100}%;left:${center.x/width*100}%;display:block;`;
  }

  catch (error) 
	{
		console.log(`發生錯誤.${error}`);
	}
}

function DefaultCasterToggle()
{
  _brake_toggle_1.checked=true;
  _brake_toggle_2.checked=true;
  _brake_toggle_3.checked=true;
  _brake_toggle_4.checked=true;
  _brake_toggle_5.checked=true;
}

function InstGLTFLoaderForAccessory(filePath,thisPos,thisRot,thisScale,thisName)
{
  const loader = new GLTFLoader();
	loader.load( filePath, function ( gltf ) {

	const model = gltf.scene;
	model.position.copy(thisPos);
	model.rotation.set(thisRot.x, thisRot.y, thisRot.z);
	model.scale.set(thisScale,thisScale,thisScale);
	model.name=thisName;

  scene.add(model);

  current_accessories.push(model);
  current_INTERSECTED=model;

  UpdateMoveModelPanelPos(model);

	});
}

///將函數掛載到全域範圍
window.InstrumentMountManager=InstrumentMountManager;
window.ColumnManager=ColumnManager;
window.BaseManager = BaseManager;
window.CasterManager=CasterManager;
window.EditMode = EditMode;
window.ShowSceneLabelToggle=ShowSceneLabelToggle;
window.AccessoryManager=AccessoryManager;
window.MoveModel=MoveModel;
window.MoveModelOFF=MoveModelOFF;
window.DeleteAccessory=DeleteAccessory;
window.TakeScreenshot=TakeScreenshot;