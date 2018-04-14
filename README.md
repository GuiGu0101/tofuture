# 给未来写封信-微信分享H5页面


## 使用说明

本前端项目完全采用百度 [FIS3](http://fis.baidu.com/) 构建，若要编译请先安装FIS3。

### 如何编译

项目已根据需求配置了多个编译命令，根据需要运行相应命令即可。

#### 1. 本地测试编译

  发布至fis内置web服务器中

  ```
  fis3 release
  ```

#### 4. 编译正式环境

  ```
  fis3 release release
  ```

  编译正式环境时，会在本地目录`D:/work/output/newhome`下分别生成一个以`newhome_<时间戳>_cdn`和`newhome_<时间戳>_ecs`格式命名的文件夹。

  cdn文件夹下为静态资源，会同时自动发布至静态资源OSS服务器`static`。

  ecs文件夹下为静态页面，发布至生成环境即可。

## 其他

关于fis的使用及语法可以参考 [FIS3 用户文档](http://fis.baidu.com/fis3/docs/beginning/intro.html)
