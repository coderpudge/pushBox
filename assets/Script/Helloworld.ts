import Box, { BOX_TYPE } from "./Box";
import { Tools } from "./Tools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    platform: cc.Node = null;
    @property(cc.Node)
    box: cc.Node = null;

    @property
    text: string = 'hello';

    map = {};

    row:number; //行
    column:number; //列
    sideLength:number // 单元格边长

    roleBoxIdx;
    isMoving:Boolean; // 是否正在移动

    round = 0;

    onLoad(){
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchStart, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.init(5,5);
    }

    start () {
       

    }


    onTouchStart(touch:cc.Event.EventTouch){

    }

    onKeyDown(event){
        console.log('Press a key',event.keyCode);
        // let diff = cc.v2();
        // switch(event.keyCode) {
        //     case cc.macro.KEY.a:
        //         diff = cc.v2(-1,0);
        //         break;
        //     case cc.macro.KEY.s:
        //         diff = cc.v2(0,-1);
        //         break;
        //     case cc.macro.KEY.d:
        //         diff = cc.v2(1,0);
        //         break;
        //     case cc.macro.KEY.w:
        //         diff = cc.v2(0,1);
        //         break;
        //     default:
        //         break;
        // }
        this.onMove(event.keyCode);
    }

    init(row,column,sideLength = 100){
        this.row = row;
        this.column = column;
        this.sideLength = sideLength;
        let rdmCount = Math.floor(row * column / 5);
        let createdList = [];
        for (let i = 0; i < rdmCount; i++) {
            let rdm = Tools.getRandom(1, this.row * this.column);
            let isCreated = createdList.indexOf(rdm) != -1;
            if (!isCreated) {
                createdList.push(rdm);
            }else{
                i--;
            }
        }
        for (let i = 0; i < createdList.length; i++) {
            let idx = createdList[i];
            if (i == 0) {
                this.createBox(idx,true);
            }else{
                this.createBox(idx);
            }
        }
    }

    /**
     * 获取第几行几列 的数据
     * @param row 行
     * @param column 列 
     */
    // getMap(row,column){
    //     return this.map[this.getMapIdx(row, column)];
    // }

    // setMap(row,column, data){
    //     this.map[this.getMapIdx(row, column)] = data;
    // }

    /**
     * 通过行和列 获取地图索引
     * @param row 
     * @param column 
     */
    getMapIdx(row, column){
        return (row-1) * this.column + column;
    }

    /**
     * 通过地图索引 获取地图的行和列
     * @param idx 
     * return cc.vec2,  x: row(行), y: column(列)
     */
    
    getMapCell(idx):Cell{
        let row = Math.ceil(idx / this.column);
        let column = idx % this.column;
        if (column == 0) {
            column = this.column;
        }
        return new Cell(row,column);
        // return cc.size(row,column);
        // return cc.v2(row,column); // x: row(行), y: column(列)
    }

    getBox(idx){
        return this.platform.getChildByName(''+idx);
    }

    /**
     * 获取平台 实际位置
     * @param row 
     * @param column 
     */
    getMapPosition(row, column){
        let x = (column - 1) * this.sideLength + 0.5 * this.sideLength;
        let y = (row - 1) * this.sideLength + 0.5 * this.sideLength;
        let anchor = this.platform.getAnchorPoint();
        let width = this.column * this.sideLength;
        let height = this.row * this.sideLength;
        // 转化起点为右上角
        return cc.v2((-anchor.x) * width + x, (anchor.y) * height - y);
    }

    createBox(idx,isRole = false){
        if (!idx || idx > this.row * this.column) {
            cc.log('exceed the maximum limit ')
        }
        let node = cc.instantiate(this.box);
        node.parent = this.platform;
        let cell = this.getMapCell(idx);
        cc.log('idx:',idx, cell.row,cell.column);
        let position = this.getMapPosition(cell.row, cell.column);
        node.position = position;
        let cmpt = node.getComponent(Box);
        let type = BOX_TYPE.WOOD;
        if (isRole) {
            type = BOX_TYPE.ROLE;
            this.roleBoxIdx = idx;
        }
        cmpt.init(this, type);
        cmpt.setCell(cell.row, cell.column)

    }

   

    onMove(keyCode){
        if (this.isMoving) {
            return;
        }
        this.isMoving = true;
        let roleCell = this.getMapCell(this.roleBoxIdx);
        let diff;
        let moveCellList = []; //需要移动的cell集合
        let count = 1;
        let towardCount = 0; //朝向目标方向的 箱子数量
        let canMoved = false;
        switch(keyCode) {
            case cc.macro.KEY.a:
                for (let i = 1; i <= this.column; i++) {
                    if (i <= roleCell.column) {
                        let idx = this.getMapIdx(roleCell.row, i);
                        let node = this.getBox(idx);
                        if (node) {
                            if (i > count) {
                                let cmpt = node.getComponent(Box);
                                cmpt.moveToCell(roleCell.row, count);
                            }
                            count ++;  
                            towardCount++; 
                        }
                    }
                }
                canMoved = towardCount != roleCell.column;
                break;
            case cc.macro.KEY.d:
                count = this.column;
                for (let i = this.column; i >= roleCell.column; i--) {
                    if (i >= roleCell.column) {
                        let idx = this.getMapIdx(roleCell.row, i);
                        let node = this.getBox(idx);
                        if (node) {
                            if (i < count) {
                                let cmpt = node.getComponent(Box);
                                cmpt.moveToCell(roleCell.row, count);
                            }
                            count --;   
                            towardCount++; 
                        }
                    }
                }
                canMoved = towardCount != this.column - roleCell.column + 1;
                break;
            case cc.macro.KEY.s:
                count = this.row;
                for (let i = this.row; i >= roleCell.row; i--) {
                    if (i >= roleCell.row) {
                        let idx = this.getMapIdx(i, roleCell.column);
                        let node = this.getBox(idx);
                        if (node) {
                            if (i < count) {
                                let cmpt = node.getComponent(Box);
                                cmpt.moveToCell(count, roleCell.column);
                            }
                            count --;   
                            towardCount++; 
                        }
                    }
                }
                canMoved = towardCount != this.row - roleCell.row + 1;
                break;
            case cc.macro.KEY.w:
                for (let i = 1; i <= this.row; i++) {
                    if (i <= roleCell.row) {
                        let idx = this.getMapIdx(i, roleCell.column);
                        let node = this.getBox(idx);
                        if (node) {
                            if (i > count) {
                                let cmpt = node.getComponent(Box);
                                cmpt.moveToCell(count, roleCell.column);
                            }
                            count ++;
                            towardCount++;    
                        }
                    }
                }
                canMoved = towardCount != roleCell.row;
                break;
            default:
                break;
        }
        if (!canMoved) {
            this.isMoving = false;
            return;
        }
        let moveTime = 1;
        this.scheduleOnce(()=>{
            this.isMoving = false;

            this.checkClear(()=>{
                let isDie = this.checkDie();
                if (isDie) {
                    cc.log('game over')
                    return;
                }else {
                    if (this.platform.childrenCount == this.row * this.column) {
                        cc.log( 'game over')
                        return;
                    }
                    let list = this.getBlockedCell();

                    let rdm ;
                    if (list.length == 1) {
                        rdm = list[0];
                    }else{
                        rdm = this.getRandomBornIdx();
                    }
                    
                    this.createBox(rdm);
                    this.checkDie();
                    this.checkClear();
                }
            })
        },moveTime);
    }

    getRandomBornIdx(){
        let list = [];
        for (let i = 1; i <= this.row * this.column; i++) {
            const node = this.getBox(i);
            if (!node) {
                list.push(i);
            } 
        }
        this.randomSortList(list);
        for (let i = 0; i < list.length; i++) {
            let rdm = list[i];
            let cell = this.getMapCell(rdm);
            // 如果可排成一排, 则过掉, 避免自动清除
            if (!this.checkLine(cell)) {
                return rdm;
            }
        }
        return list[0];
    }
    /**
     * 随机排列
     * @param arr 
     */
    randomSortList(arr){
        arr.sort(()=>{
            return Math.random()-0.5;
        });
    }

    checkClear(cb?){
        this.isMoving = true;
        let clearTime = 1;
        let cell = this.getMapCell(this.roleBoxIdx);
        let rowList = [];
        let columnList = [];
        let isClear;

        // 检查行完整度
        for (let i = 1; i <= this.row; i++) {
            let list = []
            for (let j = 1; j <= this.column; j++) {
                let idx = this.getMapIdx(i, j);
                if (idx != this.roleBoxIdx) {
                    let node = this.getBox(idx);
                    if (node) {
                        list.push(node);
                    }else{
                        list.length = 0;
                        break;
                    }
                }
            }
            if (list.length == this.column) {
                rowList.push(list);
            }
        }
        
        // 检查列完整度
        for (let i = 1; i <= this.column; i++) {
            let list = [];
            for (let j = 1; j <= this.row; j++) {
                let idx = this.getMapIdx(j, i);
                if (idx != this.roleBoxIdx) {
                    let node = this.getBox(idx);
                    if (node) {
                        list.push(node);
                    }else{
                        list.length = 0;
                        break;
                    }
                }
            }
            if (list.length == this.row) {
                columnList.push(list);
            }
        }

        if (rowList.length > 0) {
            for (let i = 0; i < rowList.length; i++) {
                const list = rowList[i];
                for (let j = 0; j < list.length; j++) {
                    const node = list[j];
                    let cmpt:Box = node.getComponent(Box);
                    cmpt.hide();
                }
            }
            isClear = true;
        }

        if (columnList.length > 0) {
            for (let i = 0; i < columnList.length; i++) {
                let list = columnList[i];
                for (let j = 0; j < list.length; j++) {
                    const node = list[j]
                    let cmpt = node.getComponent(Box);
                    cmpt.hide();
                }
            }
            isClear = true;
        }
        if (isClear) {
            this.scheduleOnce(()=>{
                if (cb) {
                    cb();
                }
                this.isMoving = false;
            },clearTime);
        }else{
            if (cb) {
                cb();
            }
            this.isMoving = false;
        }

    }

    /**
     * 检查如果插入 cell后, 是否有路可走
     * @param cell 
     */
    checkDie(cell?:Cell){
        if (this.platform.childrenCount == this.row * this.column) {
            return true;
        }
        if (!cell) {
            cell = this.getMapCell(this.roleBoxIdx);
        }
        let lrWay = false;// 左右路 可走
        let udWay = false;// 上下路 可走

        for (let i = 1; i <= this.column; i++) {
            if (i != cell.column) {
                let idx = this.getMapIdx(cell.row, i);
                if (!this.getBox(idx)) {
                    // 有空格子, 横向有路可以走
                    lrWay = true;
                    break;
                }
            }
        }
        for (let i = 1; i <= this.row; i++) {
            if (i != cell.row) {
                let idx = this.getMapIdx(i, cell.column);
                if (!this.getBox(idx)) {
                    // 有空格子, 纵向有路可以走
                    udWay = true;
                    break;
                }
            }
        }

        /* if (cell.row - 1 > 0) {
            let idx = this.getMapIdx(cell.row - 1, cell.column);
            if (!this.getBox(idx)) {
                hasWay = true;
            }
        }
        if (cell.row + 1 <= this.row) {
            let idx = this.getMapIdx(cell.row + 1, cell.column);
            if (!this.getBox(idx)) {
                hasWay = true;
            }
        }
        if (cell.column - 1 > 0) {
            let idx = this.getMapIdx(cell.row , cell.column - 1);
            if (!this.getBox(idx)) {
                hasWay = true;
            }
        }
        if (cell.column + 1 <= this.column) {
            let idx = this.getMapIdx(cell.row, cell.column + 1);
            if (!this.getBox(idx)) {
                hasWay = true;
            }
        } */
        if (!lrWay  &&  !udWay) {
            cc.log('game over')
            for (let i = 0; i < this.platform.children.length; i++) {
                let node = this.platform.children[i];
                let cmpt = node.getComponent(Box);
                cmpt.hide();
            }
        }
        return !lrWay  &&  !udWay;
    }



    /**
     * 加入cell后是否可排成一排
     * @param cell 
     */
    checkLine(cell:Cell){
        if (this.platform.childrenCount == this.row * this.column) {
            return true;
        }

        let lrWay = false;// 左右路 可走
        let udWay = false;// 上下路 可走

        for (let i = 1; i <= this.column; i++) {
            if (i != cell.column) {
                let idx = this.getMapIdx(cell.row, i);
                let node = this.getBox(idx);
                if (!node || node.getComponent(Box).type == BOX_TYPE.ROLE) {
                    // 有空格子, 横向有路可以走
                    lrWay = true;
                    break;
                }
            }
        }
        if (!lrWay) {
            return true;
        }
        for (let i = 1; i <= this.row; i++) {
            if (i != cell.row) {
                let idx = this.getMapIdx(i, cell.column);
                let node = this.getBox(idx);
                if (!node || node.getComponent(Box).type == BOX_TYPE.ROLE) {
                    // 有空格子, 纵向有路可以走
                    udWay = true;
                    break;
                }
            }
        }

        return !lrWay || !udWay;
    }

    /**
     *  致命一击的 阻塞位置
     */
    getBlockedCell(){
        let cell = this.getMapCell(this.roleBoxIdx);
        let lrWay = false;// 左右路 可走
        let udWay = false;// 上下路 可走
        let lrList = [];
        let udList = [];
        for (let i = 1; i <= this.column; i++) {
            if (i != cell.column) {
                let idx = this.getMapIdx(cell.row, i);
                if (!this.getBox(idx)) {
                    // 有空格子, 横向有路可以走
                    lrList.push(idx);
                }
            }
        }
        for (let i = 1; i <= this.row; i++) {
            if (i != cell.row) {
                let idx = this.getMapIdx(i, cell.column);
                if (!this.getBox(idx)) {
                    // 有空格子, 纵向有路可以走
                    udList.push(idx);
                }
            }
        }
        return lrList.concat(udList);
    }
}

class Cell extends cc.ValueType{
    row : number; // 行;
    column : number ; //列
    constructor(row:number,column){
        super();
        this.row = row;
        this.column = column;
    }
}