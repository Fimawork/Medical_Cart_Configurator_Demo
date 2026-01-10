import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import * as FX from 'https://cdn.jsdelivr.net/gh/Fimawork/threejs_tools@v1.6/fx_functions.js';
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
let labelRenderer;

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

let _instrument_mount_content = document.getElementById('instrument_mount_content');
let _column_content = document.getElementById('column_content');
let _base_content = document.getElementById('base_content');
let _caster_content = document.getElementById('caster_content');
let _accessory_content = document.getElementById('accessory_content');
let _dimension_content= document.getElementById('dimension_content');

let _ShowLabelToggle = document.getElementById('ShowLabelToggle');
let _label_5 = document.getElementById('label_5');//配件用Label，同時用來檢查是否成功鎖定SceneTarget


//系統訊息
let _system_info= document.getElementById('system_info'); 
//Loading頁面
let _loading_canvas=document.getElementById('loading_canvas');

let _show_accessory_btn=document.getElementById('show_accessory_btn');

//移動輪規格欄位類型資訊
let caster_type="";

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

let _item_01_btn = document.getElementById('item_01_btn');
let _item_02_btn = document.getElementById('item_02_btn');
let _item_03_btn = document.getElementById('item_03_btn');
let _item_04_btn = document.getElementById('item_04_btn');
let _item_05_btn = document.getElementById('item_05_btn');
let _item_06_btn = document.getElementById('item_06_btn');
let _item_07_btn = document.getElementById('item_07_btn');
let _item_08_btn = document.getElementById('item_08_btn');
let _item_09_btn = document.getElementById('item_09_btn');
let _item_10_btn = document.getElementById('item_10_btn');
let _item_11_btn = document.getElementById('item_11_btn');
let _item_12_btn = document.getElementById('item_12_btn');
let _item_13_btn = document.getElementById('item_13_btn');
let _item_14_btn = document.getElementById('item_14_btn');
let _item_15_btn = document.getElementById('item_15_btn');
let _item_16_btn = document.getElementById('item_16_btn');
let _item_17_btn = document.getElementById('item_17_btn');
let _item_18_btn = document.getElementById('item_18_btn');
let _item_19_btn = document.getElementById('item_19_btn');
let _item_20_btn = document.getElementById('item_20_btn');

let item_btn_list=[];

let isBreakModifyAvailable;

//煞車移動輪數量(預設為5個煞車)
let current_brake_num=5;

let current_instrument_mount=[];
let current_column=[];
let current_base=[];
let current_caster=[];
let current_accessories=[];

let current_caster_css2D=[];

let sceneLabels=[];
let accessoryLabels=[];

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
	edgeStrength: 1.0,
	edgeGlow: 0,
	edgeThickness: 1,
	pulsePeriod: 0,
	color:'#6bb4f7'
};




init();
animate();
//EventListener();
BtnEventListener();
FX.InputEventListener(threeContainer);


function init()
{
  FX.SetupEnvironment("cloud");

  scene = new THREE.Scene();
  //scene.background= new THREE.Color( 0xFFFFFF );
  camera = new THREE.PerspectiveCamera( 50, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000 );//非全螢幕比例設定
  renderer = new THREE.WebGLRenderer({ antialias: true });
  //renderer.setSize( threeContainer.clientWidth, threeContainer.clientHeight );//非全螢幕比例設定

  //提高渲染解析度渲染後縮小顯示
  renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight, false);

  renderer.setClearColor(0x000000, 0.0);//需加入這一條，否則看不到CSS的底圖
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.75;
  //document.body.appendChild( renderer.domElement );
  threeContainer.appendChild( renderer.domElement );

  labelRenderer = new CSS2DRenderer();
	labelRenderer.setSize( threeContainer.clientWidth, threeContainer.clientHeight );
	labelRenderer.domElement.style.position = 'absolute';
	labelRenderer.domElement.style.top = '0px';
	threeContainer.appendChild( labelRenderer.domElement );


  const CameraDefaultPos=new THREE.Vector3(-4.848,5.501,-4.925);
  const ControlsTargetDefaultPos=new THREE.Vector3(-0.131,2.274,-0.023);
  camera.position.copy(CameraDefaultPos);
  FX.posData[0]={ camera_pos:CameraDefaultPos, controlsTarget_pos:ControlsTargetDefaultPos};

  SelectedItemControllerTarget.position.set(0,20,0);
  scene.add(SelectedItemControllerTarget);

  //儀器支架
  FX.posData[1]={ camera_pos:new THREE.Vector3(-0.244,5.351,-0.791), controlsTarget_pos:new THREE.Vector3(0.301,3.856,1.063)};
  //中柱
  FX.posData[2]={ camera_pos:new THREE.Vector3(-4.642,3.297,2.753), controlsTarget_pos:new THREE.Vector3(0.570,2.752,-0.238)};
  //底座
  FX.posData[3]={ camera_pos:new THREE.Vector3(-3.681,3.052,-1.480), controlsTarget_pos:new THREE.Vector3(0.014,0.174,-0.001)};
  //移動輪
  FX.posData[4]={ camera_pos:new THREE.Vector3(0.494,3.414,-3.141), controlsTarget_pos:new THREE.Vector3(-0.090,0.533,-0.423)};
  
  //配件(增加配件時觸發)
  FX.posData[5]={ camera_pos:new THREE.Vector3(-8.263,6.645,-7.018), controlsTarget_pos:new THREE.Vector3(0.380,3.145,0.451)};

  //推車背面(下載檔案時觸發)
  FX.posData[6]={ camera_pos:new THREE.Vector3(5.219,5.358,5.276), controlsTarget_pos:new THREE.Vector3(0.073,1.928,0.010)};

  ///利用座標設定旋轉中心及鏡頭焦點，camera不須另外設定初始角度
  //controls = new OrbitControls( camera, renderer.domElement );
  controls = new OrbitControls( camera, labelRenderer.domElement );
  controls.enableZoom=true;
  controls.enablePan = true;//右鍵平移效果
  controls.panSpeed = 0.4;
  controls.enableDamping = true;
  controls.dampingFactor =0.05;
  controls.maxDistance = 500;
  controls.target.copy( ControlsTargetDefaultPos );
  controls.zoomSpeed=0.5;
  controls.update();

  ///hdri 環境光源
  FX.LoadHDRWithPMREM('./textures/hdri/studio_small_09_2k.hdr',scene,renderer);

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
	FX.SetDefaultCameraStatus(CameraDefaultPos,ControlsTargetDefaultPos);

  
  ///主要物件
	const defaultScenes = 
  [
    () => new Promise((resolve) => setTimeout(() => { _loading_canvas.style.display="flex"; resolve(); }, 10)),//Loading頁面
		() => new Promise((resolve) => setTimeout(() => { BaseManager(1); resolve(); }, 100)),//底座&移動輪
    () => new Promise((resolve) => setTimeout(() => { InstrumentMountManager(0); resolve(); }, 110)),//儀器支撐版
    () => new Promise((resolve) => setTimeout(() => { ColumnManager(1); resolve(); }, 120)),//中柱
    
    () => new Promise((resolve) => setTimeout(() => { SetupItemImage(); resolve(); }, 200)),//設定Item的圖片
    () => new Promise((resolve) => setTimeout(() => { SetupBtnList(); resolve(); }, 400)),//設定Item案例群組 
    
    () => new Promise((resolve) => setTimeout(() => { isCameraManagerOn=true; DefaultRaycast();resolve(); }, 500)),//啟用攝影機飛行功能//重置Raycast狀態
    () => new Promise((resolve) => setTimeout(() => { SetupSceneLabel(); resolve(); }, 750)),//LabelTarget
    () => new Promise((resolve) => setTimeout(() => { _loading_canvas.style.display="none"; resolve(); }, 900)),//關閉Loading頁面 
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

  function SetupSceneLabel()
  {
    //LabelTarget
    labelTarget_instrumentMount.position.set(-0.5,4.6241445,0);
    labelTarget_column.position.set(-0.5, 2.5,0);
    labelTarget_base.position.set(0.5,0.5,0);
    labelTarget_caster.position.set(-1,0.012500000000000011, 0);
    labelTarget_accessory.position.set(1,3,0);
    scene.add(labelTarget_instrumentMount).add(labelTarget_column).add(labelTarget_base).add(labelTarget_caster).add(labelTarget_accessory);

    InstSceneLabel(labelTarget_instrumentMount,'label','label_1','1',"Select Mount Solution",1);
    InstSceneLabel(labelTarget_column,'label','label_2','2',"Select Column",2);
    InstSceneLabel(labelTarget_base,'label','label_3','3',"Select Base",3);
    InstSceneLabel(labelTarget_caster,'label','label_4','4',"Select Casters",4);
    InstSceneLabel(labelTarget_accessory,'label','label_5','5',"Select Accessories",5);
    
  }


  ///EventListener
  window.addEventListener( 'resize', onWindowResize );  
  window.addEventListener("pointerdown", (event) => {
    //InputEvent();
     mousePos = { x: event.clientX, y: event.clientY };
		onPointerMove(event);//改以點擊作為Raycast判斷的時間點，改善觸控螢幕誤判狀況
  });

  window.addEventListener("wheel", (event) => {
    //InputEvent();
  });


  //WebGLInspector(threeContainer,renderer);

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
    renderer.setSize( threeContainer.clientWidth, threeContainer.clientHeight, false );
    labelRenderer.setSize( threeContainer.clientWidth, threeContainer.clientHeight );

    composer.setSize( threeContainer.clientWidth, threeContainer.clientHeight, false );

		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / threeContainer.clientWidth, 1 / threeContainer.clientHeight );
}

function animate() 
{
  requestAnimationFrame( animate );
  
  controls.update();

  labelRenderer.render( scene, camera );
  
  RenderSwitch();

  if(isCameraManagerOn)
  {
    FX.UpdateCameraPosition(camera,controls);
    RaycastFunction();
  }
}

function RenderSwitch()
{
  if(current_INTERSECTED!=null)
  {
    composer.render();//使用postprocessing替代
  }

  else
  {
    renderer.render( scene, camera );
  }
}

function EventListener()
{

  _SelectedItemController.addEventListener("wheel",function (event) {

    if(current_INTERSECTED!=null)
    {
      if(event.deltaY<0)
      {
        MoveModel("UP");
      }

      if(event.deltaY>0)
      {
        MoveModel("DOWN");
      }  
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

        if(INTERSECTED.name.includes("accessory"))
        {
          if(current_INTERSECTED==null)//避免A物件編輯時，點選到B物件
          {
            MoveModelON(INTERSECTED);
            addSelectedObject(INTERSECTED);
          }     
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
    FX.InstGLTFDracoBase64Loader(src,modelPosition,modelRotation,modeScale,scene_name,null, scene);
    
    //指定新outline指定物件，並hightlight該物件
    setTimeout(() => {postprocessing_layer.push(scene.getObjectByName(scene_name));addSelectedObject(scene.getObjectByName(scene_name));}, delay*1000);//1000=1sec}
  }
}


function InstrumentMountManager(i)//儀器支撐板設定 
{
  current_instrument_mount=[];//移除原outline指定物件

  instrumentMount_index=i

  ResetInstrumentModule();//重置儀器支架

  SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

  if(isCameraManagerOn)FX.CameraManager(1);
  
  InstantiatModel(instrument_mount_list[i].scene_name,instrument_mount_list[i].src,current_instrument_mount,0.5);

  UpdateSpecContent( _instrument_mount_content,instrument_mount_list[i].spec_name);

}

function ColumnManager(i)
{
  current_column=[];//移除原outline指定物件

  column_index=i;

  ResetColumnModule()//重置中柱

  SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

  if(isCameraManagerOn)FX.CameraManager(2);

  InstantiatModel(column_list[i].scene_name,column_list[i].src,current_column,0.5);

  UpdateSpecContent( _column_content,column_list[i].spec_name);
}

function BaseManager(i)//底座設定功能, 變數名稱 20Base/24Base/4LegBase
{
  current_base=[];//移除原outline指定物件

  base_index=i;

  ResetBaseModule();//重置底座

  //DefaultCasterToggle();//還原為預設移動輪煞車狀態(全部含煞車)

  if(isCameraManagerOn)FX.CameraManager(3);

  InstantiatModel(base_list[i].scene_name,base_list[i].src,current_base,0.5);
  
  CasterManager(caster_index);//更新移動輪

  UpdateSpecContent(_base_content,base_list[i].spec_name);

  setTimeout(() => {CountBrakeNum();}, 1000);//1000=1sec}
}


function CasterManager(i)//移動輪設定功能
{
  SetupCasterBrakePanelOFF();

  current_caster=[];//移除原outline指定物件

  ResetCasterModule();//刪除目前場景上的移動輪

  //DefaultCasterToggle();//還原為預設移動輪煞車狀態(全部含煞車)

  caster_index=i;

  if(isCameraManagerOn)FX.CameraManager(4);
      
  InstantiatModel(caster_list[i][base_index].scene_name,caster_list[i][base_index].src,current_caster,1);

  //更新移動輪規格欄位
  caster_type=caster_list[i][base_index].spec_name;

  if(isBreakModifyAvailable)//初始化時不顯示此面板
  {
    setTimeout(() => {SetupCasterBrakePanelOn();}, 1000);//開啟移動輪編輯面板
  }
    
  setTimeout(() => {CountBrakeNum();isBreakModifyAvailable=true;}, 1000);//1000=1sec}
}

function AccessoryManager(i)
{
  let instantiate_item_hight=2;

  MoveModelOFF();//重置模型移動面板

  SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

  FX.CameraManager(5);

  InstGLTFLoaderForAccessory(accessory_list[i].src,new THREE.Vector3(modelPosition.x,modelPosition.y+instantiate_item_hight,modelPosition.z),modelRotation,modeScale,accessory_list[i].scene_name,accessory_list[i].spec_name);

  if(isLabelOn)//生成零件時不顯示Label
  {
    ShowSceneLabelToggle();
  }
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

function InstSceneLabel(thisLabelTarget,thisCSS,thisID,thisContent,thisTitle,thisEvent)
{
  const thisDiv = document.createElement( 'div' );
  thisDiv.className = thisCSS;

  if(thisContent!=null)thisDiv.textContent = thisContent;
  if(thisID!=null)thisDiv.setAttribute("id",thisID);
  if(thisTitle!=null)thisDiv.title=thisTitle;

  const thisLabel = new CSS2DObject( thisDiv );
  thisLabel.position.set( 0,0,0);
  thisLabel.center.set( 0.5, 0.5 );
  thisLabelTarget.add( thisLabel );
  thisLabel.layers.set( 0 );

  sceneLabels.push(thisLabel);

  thisDiv.addEventListener("pointerdown", () => {

    EditMode(thisEvent);
    
  });
}

function InstAccessorySceneLabel(thisLabelTarget,thisCSS,thisID,thisContent,thisTitle)
{
  const thisDiv = document.createElement( 'div' );
  thisDiv.className = thisCSS;

  if(thisContent!=null)thisDiv.textContent = thisContent;
  if(thisID!=null)thisDiv.setAttribute("id",thisID);
  if(thisTitle!=null)thisDiv.title=thisTitle;

  let center= new THREE.Vector3();
  const box= new THREE.Box3().setFromObject(thisLabelTarget);
  box.getCenter(center);

  const thisLabel = new CSS2DObject( thisDiv );
  thisLabel.position.set( center.x,center.y,center.z);
  thisLabel.center.set( 0.5, 0.5 );
  thisLabelTarget.attach( thisLabel );
  thisLabel.layers.set( 0 );
  thisLabel.name="CSS2D_Accessory_SceneLabel";

  accessoryLabels.push(thisLabel);


  InstItemController(thisLabelTarget);

  thisDiv.addEventListener("pointerdown", (event) => {

    if(document.getElementById('SelectedItemController')===null)
    {
      InstItemController(thisLabelTarget);
    }

    addSelectedObject( thisLabelTarget ); 

    if(isLabelOn)//編輯零件時不顯示Label
    {
      ShowSceneLabelToggle();
    }

     ///不執行頁面縮放 
    event.preventDefault();
    event.stopPropagation();

  });
}

function InstItemController(target)
{
  current_INTERSECTED=target;

  const controllerDiv = document.createElement( 'div' );
  controllerDiv.className = "label_fadeIn_anim";
  controllerDiv.setAttribute("id","SelectedItemController");
  controllerDiv.style.display="block";


  controllerDiv.addEventListener("wheel",function (event) {

    if(target!=null)
    {
      if(event.deltaY<0)
      {
        MoveModel("UP");
      }

      if(event.deltaY>0)
      {
        MoveModel("DOWN");
      }  
    }

    ///不執行Zoom in/out 
    event.preventDefault();
    event.stopPropagation();
      
  });
 
  const windowDiv = document.createElement( 'div' );
  windowDiv.className = "window_blinking_anim";
  windowDiv.setAttribute("id","SelectedItemWindow");

  controllerDiv.append(windowDiv);

  const leftBtnDiv = document.createElement( 'div' );
  leftBtnDiv.className = "ControllerBtn";
  leftBtnDiv.title="Turn Clockwise";
  leftBtnDiv.style.setProperty('top', '50%');
	leftBtnDiv.style.setProperty('left', '5%');

  const icon_left = document.createElement( 'j' );
  icon_left.className = "fa-solid fa-angle-left fa-2x";
  leftBtnDiv.append(icon_left);

  windowDiv.append(leftBtnDiv);


  leftBtnDiv.addEventListener("pointerdown",function (event) {

    MoveModel(`LEFT`);

    ///不執行頁面縮放 
    event.preventDefault();
    event.stopPropagation();
      
  });

  const rightBtnDiv = document.createElement( 'div' );
  rightBtnDiv.className = "ControllerBtn";
  rightBtnDiv.title="Turn Counterclockwise";
  rightBtnDiv.style.setProperty('top', '50%');
	rightBtnDiv.style.setProperty('right', '-20%');

  const icon_right = document.createElement( 'j' );
  icon_right.className = "fa-solid fa-angle-right fa-2x";
  rightBtnDiv.append(icon_right);

  windowDiv.append(rightBtnDiv);

  rightBtnDiv.addEventListener("pointerdown",function (event) {

    MoveModel(`RIGHT`);

     ///不執行頁面縮放 
    event.preventDefault();
    event.stopPropagation();
      
  });

  const upBtnDiv = document.createElement( 'div' );
  upBtnDiv.className = "ControllerBtn";
  upBtnDiv.title="Move Up";
  upBtnDiv.style.setProperty('top', '5%');
	upBtnDiv.style.setProperty('left', '50%');

  const icon_up = document.createElement( 'j' );
  icon_up.className = "fa-solid fa-angle-up fa-2x";
  upBtnDiv.append(icon_up);

  windowDiv.append(upBtnDiv);

  upBtnDiv.addEventListener("pointerdown",function (event) {

    MoveModel(`UP`);

    ///不執行頁面縮放 
    event.preventDefault();
    event.stopPropagation();
      
  });

  const downBtnDiv = document.createElement( 'div' );
  downBtnDiv.className = "ControllerBtn";
  downBtnDiv.title="Move Down";
  downBtnDiv.style.setProperty('bottom', '-20%');
	downBtnDiv.style.setProperty('left', '50%');

  const icon_down = document.createElement( 'j' );
  icon_down.className = "fa-solid fa-angle-down fa-2x";
  downBtnDiv.append(icon_down);

  windowDiv.append(downBtnDiv);

  downBtnDiv.addEventListener("pointerdown",function (event) {

    MoveModel(`DOWN`);

    ///不執行頁面縮放 
    event.preventDefault();
    event.stopPropagation();
      
  });

  const confirmBtnDiv = document.createElement( 'div' );
  confirmBtnDiv.className = "ControllerBtn";
  confirmBtnDiv.title="Confirm";
  confirmBtnDiv.style.setProperty('top', '4%');
	confirmBtnDiv.style.setProperty('right', '-8%');
  confirmBtnDiv.style.setProperty('width', '15%');
	confirmBtnDiv.style.setProperty('height', '15%');
  confirmBtnDiv.style.setProperty('box-shadow', '0 4px 30px rgba(0, 0, 0, 0.1)');

  const icon_confirm = document.createElement( 'j' );
  icon_confirm.className = "fa-solid fa-check fa-2x";
  confirmBtnDiv.append(icon_confirm);

  windowDiv.append(confirmBtnDiv);

  confirmBtnDiv.addEventListener("pointerdown",function () {

    MoveModelOFF();
      
  });

  const deleteBtnDiv = document.createElement( 'div' );
  deleteBtnDiv.className = "ControllerBtn";
  deleteBtnDiv.title="Delete";
  deleteBtnDiv.style.setProperty('bottom', '-10%');
	deleteBtnDiv.style.setProperty('right', '-8%');
  deleteBtnDiv.style.setProperty('width', '15%');
	deleteBtnDiv.style.setProperty('height', '15%');
  deleteBtnDiv.style.setProperty('box-shadow', '0 4px 30px rgba(0, 0, 0, 0.1)');

  const icon_delete = document.createElement( 'j' );
  icon_delete.className = "fa-solid fa-xmark fa-2x";
  deleteBtnDiv.append(icon_delete);

  windowDiv.append(deleteBtnDiv);

  deleteBtnDiv.addEventListener("pointerdown",function () {

    target.remove(controllerDiv);
    target.remove(thisLabel);
    controllerDiv.remove();
    controllerDiv.element = null;

    DeleteAccessory();
      
  });

  let center= new THREE.Vector3();
  const box= new THREE.Box3().setFromObject(target);
  box.getCenter(center);
 
  const thisLabel = new CSS2DObject( controllerDiv );
  thisLabel.position.set( center.x,center.y,center.z);
  thisLabel.center.set( 0.5, 0.5 );
  target.attach( thisLabel );
  thisLabel.layers.set( 0 );
  thisLabel.name="CSS2D_SelectedItemController";

}

function EditMode(i) //編輯模式 0:default , 1:儀器支架 2:中柱 3:底座 4:移動輪 5:配件
{

  switch(i)
  {
    case 0:

    FX.CameraManager(0);

    FilterItems(0);//還原篩選狀態

    MoveModelOFF();//關閉配件操作面板

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 1:

    FX.CameraManager(1);

    for(let i=0;i<current_instrument_mount.length;i++)
    {
      addSelectedObject(current_instrument_mount[i]);
    }

    FilterItems(1);

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 2:

    FX.CameraManager(2);

    for(let i=0;i<current_column.length;i++)
    {
      addSelectedObject(current_column[i]);
    }

    FilterItems(2);

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 3:

    FX.CameraManager(3);

    for(let i=0;i<current_base.length;i++)
    {
      addSelectedObject(current_base[i]);
    }

    FilterItems(3);

    SetupCasterBrakePanelOFF();//關閉移動輪編輯面板

    break;

    case 4:

    FX.CameraManager(4);

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

    //重置所有Raycast狀態
  DefaultRaycast();
  
}


///Outline效果&重置尺寸
function addSelectedObject( object ) 
{
  try 
  {
    selectedObjects = [];
    selectedObjects.push( object );
    setTimeout(() => {outlinePass.selectedObjects = selectedObjects;}, 200);//1000=1sec}//oultine效果開始
    setTimeout(() => {outlinePass.selectedObjects = [];selectedObjects = [];}, 1500);//1000=1sec}//oultine效果結束
      
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
    for(let i=0;i<sceneLabels.length;i++)
    {
      sceneLabels[i].visible=true;
    }
    
    isLabelOn=true;
  }

  else
  {
    for(let i=0;i<sceneLabels.length;i++)
    {
      sceneLabels[i].visible=false;
    }

    isLabelOn=false;
  }
}

function ShowAccessorySceneLabelToggle()
{
  let isOn=accessoryLabels[0].visible;

  for(let i=0;i<accessoryLabels.length;i++)
  {
    accessoryLabels[i].visible=!isOn;
  }

  if(accessoryLabels[0].visible)
  {
    _show_accessory_btn.style.cssText = "color:#6bb4f7";
  }

  else
  {
    _show_accessory_btn.style.cssText = "color:rgba(0, 0, 0, 0.45);";
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
  
    if(isLabelOn)//移動零件時不顯示Label
    {
      ShowSceneLabelToggle();
    }
  }

  catch (error) 
	{
		console.log(`發生錯誤.${error}`);
	}
}

function MoveModelOFF()
{

  if(document.getElementById('SelectedItemController')!=null)
  {
    current_INTERSECTED.traverse((obj) => {
      if (obj.isCSS2DObject&&obj.name==="CSS2D_SelectedItemController") {

        current_INTERSECTED.remove(obj);

      }
    });
  }

  if(current_INTERSECTED!=null&&current_INTERSECTED.position.y>=1)
  {

    current_INTERSECTED.traverse((obj) => {
        if (obj.isCSS2DObject&&obj.name==="CSS2D_Accessory_SceneLabel") {

          current_INTERSECTED.remove(obj);
          
        }
    });

    current_INTERSECTED=null;

    //提示面板
    ShowErrorDialog();
  }

  if(current_INTERSECTED!=null&&current_INTERSECTED.position.y<=-3.5)
  {

    current_INTERSECTED.traverse((obj) => {
        if (obj.isCSS2DObject&&obj.name==="CSS2D_Accessory_SceneLabel") {

          current_INTERSECTED.remove(obj);
          
        }
    });

    current_INTERSECTED=null;

    //提示面板
    ShowErrorDialog();
  }
  
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
  //CameraManager(0);

  isSelectedItemControllerOn=false;

  //重置Raycast狀態
  DefaultRaycast();
}

function DeleteAccessory()
{
  try
  {
    if(current_INTERSECTED!=null)
    {
      
      current_INTERSECTED.traverse((obj) => {
        if (obj.isCSS2DObject&&obj.name==="CSS2D_Accessory_SceneLabel") {

          current_INTERSECTED.remove(obj);

        }
      });

      scene.remove(current_INTERSECTED);
      current_INTERSECTED=null;
    }

    if(current_INTERSECTED==null)
    {
      //scene.remove(FindLatestAccessory());
      DeleteunreasonableItem();
    }

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
  for(let i=0;i<current_accessories.length;i++)
  {
    if(current_accessories[i].position.y>=maximum_height||current_accessories[i].position.y<=minimum_height)
    {
      //刪除Accessory Label
      if(document.getElementById(`${current_accessories[i].name}`)!=null)
      {
        document.getElementById(`${current_accessories[i].name}`).remove();
      }

      scene.remove(current_accessories[i]);

      current_accessories[i].traverse( function ( object ) {

			if ( object.isMesh )
			{
				object.geometry.dispose();
			}
		});
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
   scale: 1
 });

  //載入玻璃面板
 const frozenGlassPanel = document.getElementById('frozenGlassPanel');
 const _frozenGlassPanel = await html2canvas(frozenGlassPanel, {
   backgroundColor: false, // null保持透明,false不透明
   useCORS: true,
   scale: 1
 });

 //使用 html2canvas 渲染 UI（不包含 WebGL canvas）
  const specificationTable = document.getElementById('grid_table');
  const _specificationTable = await html2canvas(specificationTable, {
    backgroundColor: null, // null保持透明,false不透明
    useCORS: true,
    scale: 1
  });

  //主標題
  const MainTitle = document.getElementById('main_title');
  const _MainTitle = await html2canvas(MainTitle, {
   backgroundColor: null, // null保持透明,false不透明
   useCORS: true,
   scale: 1
  });

  //副標題
  const SubTitle = document.getElementById('sub_title');
  const _SubTitle = await html2canvas(SubTitle, {
   backgroundColor: null, // null保持透明,false不透明
   useCORS: true,
   scale: 1
  });

  setTimeout(() => {_loading_canvas.style.display="flex";FX.CameraManager(0);}, 100);//1000=1sec}//開啟LoadingPage，回預設鏡頭位置
  setTimeout(() => { firstShot();}, 750);//1000=1sec}
  setTimeout(() => {FX.CameraManager(6);}, 1000);//1000=1sec}鏡頭轉向推車背面
  setTimeout(() => { SecondShot();}, 2000);//1000=1sec}
  setTimeout(() => { SetupTimeData();}, 2500);//1000=1sec}
  setTimeout(() => { DrawTheImage();}, 3000);//1000=1sec}
  setTimeout(() => { FX.CameraManager(0);}, 4000);//1000=1sec}下載結束鏡頭歸位
  setTimeout(() => { _loading_canvas.style.display="none";}, 5000);//1000=1sec}//隱藏LoadingPage

 function firstShot()//取得 Three.js 第一張畫面為圖片
 {
    renderer.render( scene, camera ); // 如果你有使用 postprocessing  
    threeImageData_01 = renderer.domElement.toDataURL('image/png');
 }

 function SecondShot()//取得 Three.js 第二張畫面為圖片
 {
    renderer.render( scene, camera ); // 如果你有使用 postprocessing
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
      ctx.drawImage(threeImg_02, 540, 0);

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

  if(current_caster[0]!=null)
  {
    current_caster[0].children[0].traverse( function ( object ) {
    
			if ( object.name.includes("Break"))
			{
        const thisLabel = document.createElement( 'label' );
        thisLabel.className = "switch label_fadeIn_anim";

        const thisInput = document.createElement('input');
        thisInput.type = 'checkbox';


        thisInput.checked = object.visible;

        thisLabel.append(thisInput);

        if(isMobile())
        {
          thisLabel.addEventListener("change",function (event) {
                  
            object.visible = thisInput.checked;
            CountBrakeNum();

          });
        }

        if(!isMobile())
        {
          thisLabel.addEventListener("pointerdown",function (event) {
                  
            thisInput.checked=!thisInput.checked;
            object.visible=thisInput.checked;
            CountBrakeNum();

        });
        }



        const thisSpan = document.createElement('span');
        thisSpan.className = 'slider round';

        thisLabel.append(thisSpan);

        const thisDiv = document.createElement('div');
        thisDiv.className = 'toggle_title';
        thisDiv.draggable = false;
        thisDiv.textContent = 'Brake';

        thisLabel.append(thisDiv);

        current_caster_css2D.push(thisLabel);

        let center= new THREE.Vector3();
        const box= new THREE.Box3().setFromObject(object);
        box.getCenter(center);

        const caster_toggle = new CSS2DObject( thisLabel );
        caster_toggle.position.set( center.x,center.y,center.z);
        caster_toggle.center.set( 0.5, 0.5 );
        object.parent.attach( caster_toggle );
			}
    });
  }
}

function SetupCasterBrakePanelOFF()
{
  isCasterFocus=false;

  for(let i=0;i<current_caster.length;i++)
  {
    current_caster[i].traverse((obj) => {
        if (obj.isCSS2DObject) {
          
          obj.parent.remove(obj);

        }
      });
  }

  current_caster_css2D=[];

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

function InstGLTFLoaderForAccessory(base64String,thisPos,thisRot,thisScale,thisName,thisSpecName)
{

	const arrayBuffer = FX.Base64ToArrayBuffer(base64String);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(FX.dracoLoader);
  loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
            
            const model = gltf.scene;
            model.position.copy(thisPos);
            model.rotation.set(thisRot.x, thisRot.y, thisRot.z);
            model.scale.set(thisScale,thisScale,thisScale);
            model.name=thisName;

            scene.add(model);
            current_accessories.push(model);
            current_INTERSECTED=model;

            addSelectedObject(model);

            //InstSceneLabel(thisLabelTarget,thisCSS,thisID,thisContent,thisTitle,thisEvent)

            InstAccessorySceneLabel(model,'accessory_tag',`${thisName}`,'',`${thisSpecName}`);
        },
        (error) => {
            console.error('Failed to load model:', error);
        }
    );
}


function UpdateMoveModelPanelPos()
{
  if(current_INTERSECTED!=null)
  {
    const aspect = threeContainer.clientWidth / threeContainer.clientHeight;

		if(aspect>1.5)//PC或平板
		{
			let center= new THREE.Vector3();

      isSelectedItemControllerOn=true;

      const box= new THREE.Box3().setFromObject(current_INTERSECTED);
      box.getCenter(center);

      var width = threeContainer.clientWidth, height = threeContainer.clientHeight;
      var widthHalf = width / 2, heightHalf = height / 2;

      center.project(camera);
      center.x = ( center.x * widthHalf ) + widthHalf;
      center.y = - ( (center.y) * heightHalf ) + heightHalf;

      _SelectedItemController.style.cssText = `position:absolute;top:${center.y/height*100}%;left:${center.x/width*100}%;display:block;`;
		}

    else
    {
      _SelectedItemController.style.cssText = `position:absolute;top:50%;left:50%;display:block;`;
    }


  }

  else
  {
    _SelectedItemController.style.display="none";
  }
}

function BtnEventListener()
{
  //let _default_camera_btn=document.getElementById('default_camera_btn');
  //
  //_default_camera_btn.addEventListener("click",function () {
//
  //  FX.CameraManager(0);
  //    
  //});

  let _reset_btn=document.getElementById('reset_btn');

  _reset_btn.addEventListener("click",function () {

    EditMode(0);
      
  });

  
  _show_accessory_btn.style.cssText = "color:#6bb4f7";

  _show_accessory_btn.addEventListener("click",function () {

    ShowAccessorySceneLabelToggle();
      
  });

  let _show_spec_btn=document.getElementById('show_spec_btn');
  let _hide_spec_btn=document.getElementById('hide_spec_btn');
  let _grid_table=document.getElementById('grid_table');

  _show_spec_btn.addEventListener("click",function () {

    _grid_table.style.display="grid";
    _hide_spec_btn.style.display="block";

  });

  _hide_spec_btn.addEventListener("click",function () {

    _grid_table.style.display="none";
    _hide_spec_btn.style.display="none";

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