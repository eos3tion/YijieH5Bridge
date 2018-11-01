//
//  NSObject+JSSupport.m
//  PokerPF
//
//  Created by 君游 on 2017/6/27.
//  Copyright © 2017年 jy. All rights reserved.
//

#import "JSSupport.h"

@implementation JSSupport
{
    NSString *locationSuccess;
}

-(CLLocationManager *)locMgr{
    if (_locMgr==nil) {
        //1.创建位置管理器（定位用户的位置）
        self.locMgr=[[CLLocationManager alloc]init];
        _locMgr.distanceFilter=kCLHeadingFilterNone;
        _locMgr.desiredAccuracy=kCLLocationAccuracyBestForNavigation;
        //2.设置代理
        self.locMgr.delegate=self;
    }
    return _locMgr;
}


-(id) initWithWebView:(WKWebView *)view contentController:(WKUserContentController *)controller{
    if(self = [super init]){
        self.methods = @[
                         @"getBattery",
                         @"getLocation",
                         @"getGUID"
                         ];
        self.scriptFilePath = @"/JSSupport.js";
        [self doInitWithWebView:view contentController:controller];
    }
    return self;
}
//获取电量信息
-(void)getBattery:(NSDictionary*) params{
    NSString *onsuccess = params[@JS_SUCCESS];
//    电量的范围从0.0（全部泻出）-1.0（100%）标准w3c的电量是从 0 ~ 1.0，所以加上`-`号
    [self jsCallback:onsuccess withString:/* DISABLES CODE */[NSString stringWithFormat:@"%f",-[[UIDevice currentDevice] batteryLevel]]];
}
//获取地理位置信息
-(void)getLocation:(NSDictionary*) params{    
    if([CLLocationManager locationServicesEnabled]){
        [self.locMgr requestWhenInUseAuthorization];
        locationSuccess = params[@JS_SUCCESS];
        [self.locMgr startUpdatingLocation];
        
    }else{
        //无法获取地理位置信息
        NSString *onerror = params[@JS_ERROR];
        [self jsCallback:onerror withData:nil];
    }
}
//获取设备标示
-(void)getGUID:(NSDictionary*)params{
    NSString *onsuccess = params[@JS_SUCCESS];
    [self jsCallback:onsuccess withString:[NSString stringWithFormat:@"'%@'",[[UIDevice currentDevice].identifierForVendor UUIDString]]];
}

#pragma mark-CLLocationManagerDelegate
-(void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations{
    if(locationSuccess!=nil){
        CLLocationCoordinate2D coord = [[locations firstObject] coordinate];
        [self jsCallback:locationSuccess withString:[NSString stringWithFormat:@"{latitude:%f,longitude:%f}",coord.latitude,coord.longitude]];
    }
    [self.locMgr stopUpdatingLocation ];
}

@end
