import {draco_3inchCasterFor4LegBase} from './models/draco_3inchCasterFor4LegBase_slices.js';
import {draco_3inchCasterFor20Base} from './models/draco_3inchCasterFor20Base_slices.js';
import {draco_3inchCasterFor24Base} from './models/draco_3inchCasterFor24Base_slices.js';
import {draco_3inchMedicalCasterFor4LegBase} from './models/draco_3inchMedicalCasterFor4LegBase_slices.js';
import {draco_3inchMedicalCasterFor20Base} from './models/draco_3inchMedicalCasterFor20Base_slices.js';
import {draco_3inchMedicalCasterFor24Base} from './models/draco_3inchMedicalCasterFor24Base_slices.js';
import {draco_4inchCasterFor4LegBase} from './models/draco_4inchCasterFor4LegBase_slices.js';
import {draco_4inchCasterFor20Base} from './models/draco_4inchCasterFor20Base_slices.js';
import {draco_4inchCasterFor24Base} from './models/draco_4inchCasterFor24Base_slices.js';
import {draco_4LegBase} from './models/draco_4LegBase_slices.js';
import {draco_12And15Tube} from './models/draco_12And15Tube_slices.js';
import {draco_15And20Tube} from './models/draco_15And20Tube_slices.js';
import {draco_15StainlessSteelTube} from './models/draco_15StainlessSteelTube_slices.js';
import {draco_20Base} from './models/draco_20Base_slices.js';
import {draco_24Base} from './models/draco_24Base_slices.js';
import {draco_accessory_01} from './models/draco_accessory_01_slices.js';
import {draco_accessory_02} from './models/draco_accessory_02_slices.js';
import {draco_accessory_03} from './models/draco_accessory_03_slices.js';
import {draco_accessory_04} from './models/draco_accessory_04_slices.js';
import {draco_accessory_05} from './models/draco_accessory_05_slices.js';
import {draco_accessory_06} from './models/draco_accessory_06_slices.js';
import {draco_accessory_07} from './models/draco_accessory_07_slices.js';
import {draco_accessory_08} from './models/draco_accessory_08_slices.js';
import {draco_AngleAdjustableWithSlidePanel} from './models/draco_AngleAdjustableWithSlidePanel_slices.js';
import {draco_FixedAnglePanel} from './models/draco_FixedAnglePanel_slices.js';
import {draco_FixedAngleWithSlidePanel} from './models/draco_FixedAngleWithSlidePanel_slices.js';

///InstrumentMount

const instrument_mount_01 = {
	scene_name:"FixedAnglePanel",
	src: draco_FixedAnglePanel(),
	spec_name: "Fixed Mounting Plate",
	item_img:'./images/FixAnglePanel.png'
};

const instrument_mount_02 = {
	scene_name:"FixedAngleWithSlidePanel",
	src: draco_FixedAngleWithSlidePanel(),
	spec_name: "Fixed Angle Instrument Holder with Slide-in Mounting Plate",
	item_img:'./images/FixedAngleWithSlidePanel.png'
};

const instrument_mount_03 = {
	scene_name:"AngleAdjustableWithSlidePanel",
	src: draco_AngleAdjustableWithSlidePanel(),
	spec_name: "Angle Adjustable Instrument Holder With Slide-in Mounting Plate",
	item_img:'./images/AngleAdjustableWithSlidePanel.png'
};

export let instrument_mount_list=[instrument_mount_01,instrument_mount_02,instrument_mount_03];


///Column

const column_01 = {
	scene_name:"15StainlessSteelTube",
	src: draco_15StainlessSteelTube(),
	spec_name: "Ø1-1/2 inches stainless steel pole",
	item_img:'./images/1500StainlessSteelTube.png'
};

const column_02 = {
	scene_name:"15And20HeighAdjustableTube",
	src: draco_15And20Tube(),
	spec_name: "Ø1-1/2 inches/Ø2 inches pole",
	item_img:'./images/1520HeightAjustableTube.png'
};

const column_03 = {
	scene_name:"12And15HeighAdjustableTube",
	src: draco_12And15Tube(),
	spec_name: "Ø1-1/4 inches/Ø1.5 inches pole",
	item_img:'./images/1215HeightAdjustableTube.png'
};

export let column_list=[column_01,column_02,column_03];


///Base

const base_01 = {
	scene_name:"20Base",
	src: draco_20Base(),
	spec_name: "5-Leg Base (20”)",
	item_img:'./images/20inchBase.png'
};

const base_02 = {
	scene_name:"24Base",
	src: draco_24Base(),
	spec_name: "5-Leg Base (24”)",
	item_img:'./images/24inchBase.png'
};

const base_03 = {
	scene_name:"4LegBase",
	src: draco_4LegBase(),
	spec_name: "4-Leg Base",
	item_img:'./images/4LegBase.png'
};

export let base_list=[base_01,base_02,base_03];


///Caster

const caster_01=[
	{
		scene_name:"3inchCasterFor20BaseModule",
		src: draco_3inchCasterFor20Base(),
		spec_name: "3 inch Twin-wheel Caster",
		item_img:'./images/3inchTwinWheelCaster.png'
	},
	{
		scene_name:"3inchCasterFor24BaseModule",
		src: draco_3inchCasterFor24Base(),
		spec_name: "3 inch Twin-wheel Caster",
		item_img:'./images/3inchTwinWheelCaster.png'
	},
	{
		scene_name:"3inchCasterFor4LegBaseModule",
		src: draco_3inchCasterFor4LegBase(),
		spec_name: "3 inch Twin-wheel Caster",
		item_img:'./images/3inchTwinWheelCaster.png'
	}
]

const caster_02=[
	{
		scene_name:"4inchCasterFor20BaseModule",
		src: draco_4inchCasterFor20Base(),
		spec_name: "4 inch Twin-wheel Caster",
		item_img:'./images/4inchTwinWheelCaster.png'
	},
	{
		scene_name:"4inchCasterFor24BaseModule",
		src: draco_4inchCasterFor24Base(),
		spec_name: "4 inch Twin-wheel Caster",
		item_img:'./images/4inchTwinWheelCaster.png'
	},
	{
		scene_name:"4inchCasterFor4LegBaseModule",
		src: draco_4inchCasterFor4LegBase(),
		spec_name: "4 inch Twin-wheel Caster",
		item_img:'./images/4inchTwinWheelCaster.png'
	}
]

const caster_03=[
	{
		scene_name:"3incMedicalCasterFor20BaseModule",
		src: draco_3inchMedicalCasterFor20Base(),
		spec_name: "3 inch Medical Caster",
		item_img:'./images/3inchMedicalCaster.png'
	},
	{
		scene_name:"3inchMedicalCasterFor24BaseModule",
		src: draco_3inchMedicalCasterFor24Base(),
		spec_name: "3 inch Medical Caster",
		item_img:'./images/3inchMedicalCaster.png'
	},
	{
		scene_name:"3inchMedicalCasterFor4LegBaseModule",
		src: draco_3inchMedicalCasterFor4LegBase(),
		spec_name: "3 inch Medical Caster",
		item_img:'./images/3inchMedicalCaster.png'
	}
]

export let caster_list=[caster_01,caster_02,caster_03];

///Accessory
///以accessory命名，方便一次查詢場景上的所有配件
const accessory_01 = {
	scene_name:"accessory_01_",
	src: draco_accessory_01(),
	spec_name: "Tubular Utility Basket",
	item_img:'./images/Basket.png'
};

const accessory_02 = {
	scene_name:"accessory_02_",
	src: draco_accessory_02(),
	spec_name: "Universal Adapter Holder",
	item_img:'./images/AdapterHolder.png'
};

const accessory_03 = {
	scene_name:"accessory_03_",
	src: draco_accessory_03(),
	spec_name: "Work Surface",
	item_img:'./images/Shelf.png'
};

const accessory_04 = {
	scene_name:"accessory_04_",
	src: draco_accessory_04(),
	spec_name: "Universal Adapter Holder with Cable Management",
	item_img:'./images/CableManagementHolder.png'
};

const accessory_05 = {
	scene_name:"accessory_05_",
	src: draco_accessory_05(),
	spec_name: "Barcode Scanner Holder",
	item_img:'./images/BarcodeScannerHolder.png'
};

const accessory_06 = {
	scene_name:"accessory_06_",
	src: draco_accessory_06(),
	spec_name: "Grip Handle",
	item_img:'./images/Handle.png'
};

const accessory_07 = {
	scene_name:"accessory_07_",
	src: draco_accessory_07(),
	spec_name: "Medical Rail",
	item_img:'./images/Rail.png'
};

const accessory_08 = {
	scene_name:"accessory_08_",
	src: draco_accessory_08(),
	spec_name: "Printer Holder",
	item_img:'./images/PrinterHolder.png'
};

export let accessory_list=[accessory_01,accessory_02,accessory_03,accessory_04,accessory_05,accessory_06,accessory_07,accessory_08];
