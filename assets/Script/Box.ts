import Helloworld from "./Helloworld";
import { Tools } from "./Tools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Box extends cc.Component {

    @property(cc.Node)
    icon: cc.Node = null;
    @property(cc.Label)
    hp: cc.Label = null;

    type;
    curHp = 1;
    target:Helloworld;
    row;//行
    column;//列;
    cellSpeed = 600;

    init(target, type:BOX_TYPE){
        this.target = target;
        this.type = type;
        Tools.loadSprite(this.icon, this.getIcon(type), cc.size(90,90));
        this.curHp = 1;
        this.setHp();
    }

    // 标记单元格坐标
    setCell(row,column){
        this.row = row;
        this.column = column;
        let idx = this.target.getMapIdx(row, column);
        this.node.name = idx+'';
        if (this.type == BOX_TYPE.ROLE) {
            this.target.roleBoxIdx = idx;
        }
    }

    moveToCell(row,column){
        let position = this.target.getMapPosition(row, column);
        let time = this.node.position.sub(position).mag() / this.cellSpeed;
        let action = cc.moveTo(0.5, position);
        this.node.runAction(action);
       
        this.setCell(row, column);
    }

    setHp(){
        if (this.curHp > 1) {
            this.hp.node.active = true;
            this.hp.string = `${this.curHp}`;
        }else{
            this.hp.node.active = false;
        }
    }

    getIcon(type:BOX_TYPE){
        let url = '';
        switch (type) {
            case BOX_TYPE.ROLE:
                url = 'img/role';
                break;
            case BOX_TYPE.WOOD:
                url = 'img/woodbox';
                break;
            case BOX_TYPE.STONE:
                url = 'img/stoneHouse';
                break;
            case BOX_TYPE.PLANT:
                url = 'img/plant';
                break;
        
            default:
                break;
        }
        return url;
    }

    hide(){
        let shrink = cc.scaleTo(0.2, 0.5);
        let enlarge = cc.scaleTo(0.2, 1);
        let cb = cc.callFunc(()=>{
            this.node.destroy()
        })
        let seq = cc.sequence(shrink.clone(),enlarge.clone(),shrink.clone(),enlarge.clone(), cb);
        this.node.runAction(seq);
    }
    
    // update (dt) {}
}
export enum BOX_TYPE {
    ROLE = 1,
    WOOD = 2,
    STONE = 3,
    PLANT = 4,
}