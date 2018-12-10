//
//  ViewController.m
//  hqgbt
//
//  Created by 君游 on 2018/9/27.
//  Copyright © 2018年 junyou. All rights reserved.
//

#import "ViewController.h"
#import "JSSupport.h"
#import "JSBridge1sdk.h"
#import "Define.h"

@interface ViewController ()
@end

@implementation ViewController{
    WKWebView * webView;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    WKUserContentController *c =[[WKUserContentController alloc] init];
    WKWebViewConfiguration *conf = [[WKWebViewConfiguration alloc] init];
    conf.userContentController = c;
    webView = [[WKWebView alloc] initWithFrame:self.view.bounds configuration:conf];
    [BaseJSBridge injectBaseBridgeJS:webView contentController:c];
    (void)[[JSSupport alloc]initWithWebView:webView contentController:c];
    (void)[[JSBridge1sdk alloc]initWithWebView:webView contentController:c];
    [self.view addSubview: webView];
    [YiJieOnlineHelper initSDKWithListener: self];
}

#pragma mark -------------------- YiJieOnlineInitDelegate ----------------------------
-(void) onResponse:(NSString*) tag : (NSString*) value {
    NSLog(@"sfwarning  onResponse:%@,%@", tag, value);
    [YiJieOnlineHelper setLoginListener: self];
    //初始化完成,开始登陆
    [self login];
}

#pragma mark -------------------- YiJieOnlineLoginDelegate ----------------------------
-(void) onLogout : (NSString *) remain {
    NSLog(@"sfwarning  logout onLogout:%@", remain);
    [self reLogin:@"注销成功"];
}

-(void) onLoginSuccess : (YiJieOnlineUser*) user : (NSString *) remain{
    NSLog(@"sfwarning  onLoginSuccess:%@", remain);
    [self onLoginCheck: user];
}
-(void) onLoginCheck : (YiJieOnlineUser*) user {
        NSLog(@"sfwarning  onLoginCheck");
    //请求服务器验证账号
    NSString* url = [NSString stringWithFormat:@"uid=%@&sess=%@&sdk=%@&app=%@",user.channelUserId,user.token,user.channelId,user.productCode];
    NSLog(@"gateUrl before:%@", url);
    url = [self encodeURI:url];
    url = [NSString stringWithFormat:@"%@?%@",@GateUrl,url];
    NSLog(@"gateUrl after:%@", url);
    NSURLRequest * urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:url]];
    NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:urlRequest completionHandler:^(NSData * _Nullable resp, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        //拿到服务端数据
        if(error==nil){
            NSDictionary *result=[NSJSONSerialization JSONObjectWithData:resp options:kNilOptions error:nil];
            NSDictionary * _Nullable code = result[@"code"];
            NSDictionary * _Nullable data = result[@"data"];
            if(code==nil){
                if(data!=nil){
                    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:data options:NSJSONWritingPrettyPrinted error:&error];
                    NSString* loginurl = data[@"loginurl"];
                    NSUInteger len = [loginurl length];
                    if(len>0){
                        NSUInteger last = len-1;
                        if([[loginurl substringFromIndex:last] isEqual: @"?"]){
                            loginurl = [loginurl substringToIndex:last];
                        }
                        NSString* url1 = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                            url1 = [self removeSpaceAndNewline:url1];
                            url1 = [self encodeURI:url1];
                            url1 = [NSString stringWithFormat:@"%@?%@",loginurl,url1 ];
                            NSLog(@"webUrl after:%@", url1);
                            dispatch_async(dispatch_get_main_queue(), ^{
                                [self loadUrl:url1];
                            });
                            return;
                        }
                    
                    }
                }
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self reLogin:@"登陆服务器失败，请稍后重试."];
                });
        }
    }];
    [task resume];
}

- (void) loadUrl:(NSString*)url{
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:url]]];
}

- (NSString *)removeSpaceAndNewline:(NSString *)str{
    str = [str stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    str = [str stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet ]];
    str = [str stringByReplacingOccurrencesOfString:@" " withString:@""];
    str = [str stringByReplacingOccurrencesOfString:@"\r" withString:@""];
    str = [str stringByReplacingOccurrencesOfString:@"\n" withString:@""];
    return str;
}



-(NSString *) encodeURI:(NSString *)uri{
    return [uri stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet characterSetWithCharactersInString:@",.:/`#%^{}\"[]|\\<> "].invertedSet];
}

-(void) reLogin:(NSString*)msg{
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:@"提示"                                                                   message:msg                                                            preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction* defaultAction = [UIAlertAction actionWithTitle:@"重新登陆" style:UIAlertActionStyleDefault                                                          handler:^(UIAlertAction * action) {
        [self login];
    }];
    UIAlertAction* cancelAction = [UIAlertAction actionWithTitle:@"退出游戏" style:UIAlertActionStyleDefault                                                          handler:^(UIAlertAction * action) {
            exit(0);
    }];
    [alert addAction:defaultAction];
    [alert addAction:cancelAction];
    [self presentViewController:alert animated:YES completion:nil];
}

-(void) onLoginFailed : (NSString*) reason : (NSString *) remain {
    [self reLogin:@"登陆服务器失败，请稍后重试."];
}

-(void) login {
    dispatch_async(dispatch_get_main_queue(), ^{
        [YiJieOnlineHelper login: @"login"];
    });
}
- (BOOL) shouldAutorotate{
    return NO;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations{
    return UIInterfaceOrientationMaskPortrait;
}
@end
