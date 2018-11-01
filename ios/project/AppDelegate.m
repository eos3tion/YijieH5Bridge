//
//  AppDelegate.m
//  IOSDemo
//
//  Created by 雪鲤鱼 on 15/6/29.
//  Copyright (c) 2015年 yijie. All rights reserved.
//

#import "AppDelegate.h"


@interface AppDelegate ()

@end

@implementation AppDelegate




- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}



- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}
//- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation NS_AVAILABLE_IOS(4_2){
//    BOOL yjResult = [[YJAppDelegae Instance] application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
//    return yjResult;
//}
- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    NSLog(@"demo application applicationDidEnterBackground！");
    //    [[YJAppDelegae Instance] setSdkDelegate:self];
    [[YJAppDelegae Instance] applicationDidEnterBackground:application];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    NSLog(@"demo application applicationWillEnterForeground！");
    [self.window makeKeyWindow];
    [YiJieOnlineHelper initSDKWithListener: self];
    [[YJAppDelegae Instance] applicationWillEnterForeground:application];
    
}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    return [[YJAppDelegae Instance] application:application didFinishLaunchingWithOptions:launchOptions];

}
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {

    [[YJAppDelegae Instance] application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];

}
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {

    [[YJAppDelegae Instance] application:application didReceiveRemoteNotification:userInfo];


}
- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    
    NSLog(@"demo application supportedInterfaceOrientationsForWindow！");
    return [[YJAppDelegae Instance] application:application supportedInterfaceOrientationsForWindow:window];// UIInterfaceOrientationMaskPortrait;
    
    
}

-(void) onResponse:(NSString*) tag : (NSString*) value {
    NSLog(@"sfwarning  onResponse:%@,%@", tag, value);
}

//- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url{
//    // Will be deprecated at some point, please replace with application:openURL:sourceApplication:annotation:
//    return  [[YJAppDelegae Instance] application:application handleOpenURL:url];
//    
//}

@end
