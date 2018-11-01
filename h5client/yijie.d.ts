
declare namespace jy._1SDK {

    export interface PayParam {
        /**
         * 回调函数
         */
        callback: { (result: PayCallbackResult) };

        /**
         * 充值金额
         */
        amount: number;

        /**
         * 附加数据
         */
        extra?: string;

        /**
         * 道具名称
         */
        itemName?: string;

        /**
         * 物品数量
         */
        count?: number;

    }


    /**
     * 重新登录游戏
     */
    export function login();

    /**
     * 退出程序
     */
    export function exit();


    export enum PayCallbackResultState {
        OnOderNo = 1,

        OnSuccess = 0,

        OnFailed = 2,
    }

    export interface PayCallbackResult {
        state: PayCallbackResultState,

        msg?: string;
    }

    export function pay(opt: PayParam);


    export interface DataInfo {
        /**
         * 当前登录的玩家角色ID
         */
        roleId: string;
        /**
         * /当前登录的玩家角色名，不能为空，不能为null
         */
        roleName: string;
        /**
         * 当前登录的玩家角色等级，必须为数字，且不能为0，若无，传入1
         */
        roleLevel: string;

        /**
         * 当前登录的游戏区服ID，必须为数字，且不能为0，若无，传入1
         */
        zoneId: string;

        /**
         * 当前登录的游戏区服名称，不能为空，不能为null
         */
        zoneName: string;

        /**
         * 用户游戏币余额，必须为数字，若无，传入"0"
         */
        balance: string;

        /**
         * 当前用户VIP等级，必须为数字，若无，传入"1"
         */
        vip: string;

        /**
         * 当前角色所属帮派，不能为空，不能为null，若无，传入“无帮派”
         */
        partyName: string;

        /**
         * 角色创建时间，单位为秒
         */
        roleCTime?: string;

        /**
         * 角色等级变化时间，单位为秒
         */
        roleLevelMTime?: string;

    }

    export const enum SetDataKey {
        /**
         * 创号时调用
         */
        CreateRole = "createrole",
        /**
         * 创建新角色时调用
         */
        LevelUp = "levelup",

        EnterServer = "enterServer"
    }

    /**
     * 设置数据
     * @param key 
     * @param value 
     */
    export function setData(key: string, value: string);

    /**
     * http://www.1sdk.cn/omsdk-sdkenter-online/2015-09-08-10-50-37/omsdk-sdkenter-online-java.html#_Toc492299951
     */
    export interface RoleInfo {
        /**
         * 角色标识
         */
        rid: Key;

        /**
         * 角色名称
         */
        name: string;

        /**
         * 角色等级
         */
        level: number;

        /**
         * 服务器标识
         */
        sid: string;
    }

    /**
     * 设置角色信息
     * @param opt 
     */
    export function setRole(opt: RoleInfo);

    type Key = number | string;
}
