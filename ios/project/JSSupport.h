//
//  做桥接支持
//  增加获取电量的js支持
//  增加获取地理位置信息的js支持
//  要求，尽可能封装的和w3c标准接近
//  
//  PokerPF
//
//  Created by 君游 on 2017/6/27.
//  Copyright © 2017年 jy. All rights reserved.
//


#import "BaseJSBridge.h"
#import <CoreLocation/CoreLocation.h>

@interface JSSupport:BaseJSBridge<InitWithWebView,CLLocationManagerDelegate>
@property(nonatomic,strong)CLLocationManager *locMgr;
@end
