//
//  BaseJSBridge.h
//  PokerPF
//
//  Created by 君游 on 2017/6/8.
//  Copyright © 2017年 jy. All rights reserved.
//

#ifndef BaseJSBridge_h
#define BaseJSBridge_h

#define JS_SUCCESS "$$onsuccess"
#define JS_ERROR "$$onerror"

#import <Foundation/Foundation.h>
#import <WebKit/WebKit.h>

@protocol InitWithWebView <NSObject>
- (id)initWithWebView:(WKWebView*)view contentController:(WKUserContentController *)controller;
@end

//js桥接基类
@interface BaseJSBridge : NSObject<WKScriptMessageHandler>

@property (nonatomic, assign) WKWebView *webView;
@property NSArray *methods;
//对应要注入的脚本文件路径
@property NSString *scriptFilePath;

//初始化基础脚本
+ (void)injectBaseBridgeJS:(WKWebView *)view contentController:(WKUserContentController *)controller;

- (void)doInitWithWebView:(WKWebView*)view contentController:(WKUserContentController *)controller;
- (void) jsCallback:(NSString*)callbackID withData:(id)data;
- (void) jsCallback:(NSString*)callbackID withString:(NSString *)data;
- (void) jsCallback:(NSString*)callbackID withError:(NSString*)error;
@end
#endif /* BaseJSBridge_h */
