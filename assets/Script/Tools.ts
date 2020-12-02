class ToolsClass{

    public static readonly Instance: ToolsClass = new ToolsClass();

    private constructor() {
        
    };   

    loadSprite(imgNode:cc.Node, url:string, resize:cc.Size){
        let sprite:cc.Sprite = imgNode.getComponent(cc.Sprite);
        if (!sprite) {
            sprite = imgNode.addComponent(cc.Sprite)
        }
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if (!err) {
                sprite.spriteFrame = spriteFrame;
                if (resize) {
                    imgNode.width = resize.width;
                    imgNode.height = resize.height;
                }
            }else{
                cc.error('cannot find img, check url:',url);
            }
        });
    }

    /**
     * 获取随机整数
     * @param n 小
     * @param m 大
     */
    getRandom(n,m){
        return Math.floor(Math.random()*(m-n)+n);
    }
}

export const Tools = ToolsClass.Instance;