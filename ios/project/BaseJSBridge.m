//
//  BaseJSBridge.m
//  PokerPF
//
//  Created by 君游 on 2017/6/8.
//  Copyright © 2017年 jy. All rights reserved.
//

#import "BaseJSBridge.h"
@implementation BaseJSBridge

@synthesize webView;

+ (void)injectBaseBridgeJS:(WKWebView *)view contentController:(WKUserContentController *)controller{
    [BaseJSBridge injectScript:@"/JSBridge.js" webView:view contentController:controller];
}

+ (void)injectScript:(NSString*)file webView:(WKWebView *)view contentController:(WKUserContentController*)controller{
    NSString * path = [[NSBundle mainBundle].resourcePath stringByAppendingString:file];
    NSString * bindingJs = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
    WKUserScript * script = [[WKUserScript alloc] initWithSource:bindingJs injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:YES];
    [controller addUserScript:script];
}

- (void) doInitWithWebView:(WKWebView *)view contentController:(WKUserContentController *)controller{
        webView = view;
        for (NSString *method in self.methods) {
            [controller addScriptMessageHandler:self name:method];
        }
        [BaseJSBridge injectScript:self.scriptFilePath webView:view contentController:controller];
}

#pragma mark incoming JavaScript message

- (void) userContentController:(WKUserContentController *)userContentController
       didReceiveScriptMessage:(WKScriptMessage *)message {
    NSString *name = message.name;
    if([self.methods indexOfObject:name]==-1){
        return NSLog(@"unrecognized method:%@",name);
    }
    name = [name stringByAppendingString:@":"];
    NSDictionary * params = (NSDictionary *) message.body;
    
    // ridiculous hoop jumping to call method by name
    SEL selector = NSSelectorFromString(name);
    IMP imp = [self methodForSelector:selector];
    void (*func)(id, SEL, NSDictionary *) = (void *)imp;
    func(self, selector, params);
    // lame hack to fix over-retained message.body (< iOS9 only)
//    if (NSFoundationVersionNumber < 1240.100000) {
//        CFRelease((__bridge CFTypeRef) params);
//    }
}

- (void) jsCallback:(NSString*)callbackID withData:(id)data{
    NSString* json = data==nil?@"": [[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:data options:0 error:nil] encoding:NSUTF8StringEncoding];
    NSString* js= [NSString stringWithFormat:@"$jsb.callback(%@,%@)", callbackID, json ];
    [self doCallback:js];
}

- (void) jsCallback:(NSString*)callbackID withString:(NSString *)data{
    NSString* js= [NSString stringWithFormat:@"$jsb.callback(%@,%@)", callbackID, data ];
    [self doCallback:js];
}

- (void) jsCallback:(NSString*)callbackID withError:(NSString*)error{
    NSString* js= [NSString stringWithFormat:@"$jsb.callback(%@,new Error('%@'))", callbackID, error ];
    [self doCallback:js];
}

-(void) doCallback:(NSString*)js{
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
        [self->webView evaluateJavaScript:js completionHandler:nil];
    }];
}


@end
