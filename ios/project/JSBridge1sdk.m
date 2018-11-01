//
//  JSBridge1sdk.m
//  hqgbt
//
//  Created by 君游 on 2018/10/8.
//  Copyright © 2018年 junyou. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "JSBridge1sdk.h"

@implementation JSBridge1sdk{
    NSString * payCID;
}

- (id)initWithWebView:(WKWebView *)view contentController:(WKUserContentController *)controller {
    if(self = [super init]){
        self.methods = @[
                         @"setRole",
                         @"pay",
                         @"login",
                         @"exit",
                         @"setData"
                         ];
        self.scriptFilePath = @"/JSBridge1sdk.js";
        [self doInitWithWebView:view contentController:controller];
    }
    return self;
}

#pragma mark --------------------js接口----------------------------
/**
 * 设置角色数据
 */
-(void)setRole:(NSDictionary*) params {
    payCID = [NSString stringWithFormat:@"%@", params[@JS_SUCCESS]];
    [YiJieOnlineHelper setRoleData:params[@"data"]];
}

- (void)onFailed:(NSString *)msg {
    if(payCID!=nil){
        NSDictionary *data = @{
                               @"state": @"2",
                               @"msg":msg
                               };
        [self jsCallback:payCID withData:data];
        payCID=nil;
    }
    NSLog(@"充值失败======%@", msg);
}

- (void)onOderNo:(NSString *)msg {
    if(payCID!=nil){
        NSDictionary *data = @{
                               @"state": @"1",
                               @"msg":msg
                               };
        [self jsCallback:payCID withData:data];
    }
    NSLog(@"充值订单======%@", msg);
}

- (void)onSuccess:(NSString *)msg {
    if(payCID!=nil){
        NSDictionary *data = @{
                               @"state": @"0",
                               @"msg":msg
                               };
        [self jsCallback:payCID withData:data];
        payCID=nil;
    }
    NSLog(@"充值成功======%@", msg);
}

-(void)pay:(NSDictionary*) params{
    NSNumber *price = params[@"unitPrice"];
    NSNumber *count = params[@"count"];
    [YiJieOnlineHelper charge:params[@"itemName"] :[price intValue] :[count intValue] :params[@"callBackInfo"] :@"":self];
}

-(void)setData:(NSDictionary*) params{
    [YiJieOnlineHelper setData:params[@"key"] :params[@"value"]];
}

-(void)exit{
    abort();
}

-(void)login{
    [YiJieOnlineHelper login: @"login"];
}


@end
