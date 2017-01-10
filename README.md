# 拓拓项目接口文档

<!-- TOC -->

* [拓拓项目接口文档](#%E6%8B%93%E6%8B%93%E9%A1%B9%E7%9B%AE%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3)
  * [说明](#%E8%AF%B4%E6%98%8E)
    * [请求格式](#%E8%AF%B7%E6%B1%82%E6%A0%BC%E5%BC%8F)
      * [GET/DELETE](#getdelete)
      * [POST/PUT](#postput)
    * [返回格式](#%E8%BF%94%E5%9B%9E%E6%A0%BC%E5%BC%8F)
      * [返回格式（请求成功）：](#%E8%BF%94%E5%9B%9E%E6%A0%BC%E5%BC%8F%E8%AF%B7%E6%B1%82%E6%88%90%E5%8A%9F)
      * [返回格式（请求失败）：](#%E8%BF%94%E5%9B%9E%E6%A0%BC%E5%BC%8F%E8%AF%B7%E6%B1%82%E5%A4%B1%E8%B4%A5)
  * [设备管理接口](#%E8%AE%BE%E5%A4%87%E7%AE%A1%E7%90%86%E6%8E%A5%E5%8F%A3)
  * [添加设备](#%E6%B7%BB%E5%8A%A0%E8%AE%BE%E5%A4%87)
    * [接口描述](#%E6%8E%A5%E5%8F%A3%E6%8F%8F%E8%BF%B0)
    * [调用范例](#%E8%B0%83%E7%94%A8%E8%8C%83%E4%BE%8B)
    * [返回范例](#%E8%BF%94%E5%9B%9E%E8%8C%83%E4%BE%8B)
    * [请求字段描述](#%E8%AF%B7%E6%B1%82%E5%AD%97%E6%AE%B5%E6%8F%8F%E8%BF%B0)
    * [返回字段描述](#%E8%BF%94%E5%9B%9E%E5%AD%97%E6%AE%B5%E6%8F%8F%E8%BF%B0)
    * [补充说明](#%E8%A1%A5%E5%85%85%E8%AF%B4%E6%98%8E)

<!-- /TOC -->

## 说明

拓拓的接口文档

### 请求格式

#### GET/DELETE

未特别说明时，GET/DELETE 请求均使用 UrlParams 作为请求参数

#### POST/PUT

未特别说明时，POST/PUT 请求均使用 "Content-Type: application/json" 作为请求头

### 返回格式

未特别说明时，均使用 "Content-Type: application/json" 作为返回头

#### 返回格式（请求成功）：

``` json
{
    "result": "success",
    "data": {}, //返回单个数据
    "collection": [] //返回集合数据
}
```

#### 返回格式（请求失败）：

``` json
{
    "result": "failed",
    "msg": {}, //错误信息
}
```

## 设备管理接口

### 添加设备

#### 接口描述

| Type | ResourceUri | 说明 |
|--------|--------|--------|
| POST | /DevicesV2/AddDevice | 无 |

#### 调用范例

``` json
{
"device": {
    "D_CODE": "xxx",
    "D_TYPE": "10",
    "D_OWNER": "mintcode",
    "D_GROUP": "98e60826-9345-45ca-a137-79ffa03cda64",
    "D_USER": "tomsun",
    "D_QRCODE_SCALE": "4",
    "D_NAME": "相机",
    },
"fields": [
    {
        "Text": "price",
        "Value": "1000",
        "Priority": "50"
    },
    {
        "Text": "size",
        "Value": "20",
        "Priority": "55"
    }
],
"annexs": "xxx?xxx?xxx"
}
```

#### 返回范例

``` json
{
"result": "success",
"data": {
    "ID": 121,
    "D_CODE": "TX01",
    "D_NAME": "牛奶",
    "D_QRCODE": "/attachment/DeviceQrcode/2015-05-06/74fe772a-2fd3-40b4-914f-6925043d3919.jpg",
    "D_QRCODE_SCALE": 4,
    "D_CONMMENT": "XXXXX",
    "D_LAST_TIME": "2015-05-06 18:14:38",
    "D_TYPE": "10",
    "D_GROUP": "avatar",
    "D_USER": "tomsun",
    "D_OWNER": "mintcode",
    "D_STATUS": "6",
    "CREATE_USER": "tomsun",
    "CREATE_USER_NAME": "Tom Sun",
    "CREATE_TIME": "2015-04-28 14:40:00",
    }
}
```

#### 请求字段描述

| 字段名 | 字段 | 数据类型 | 描述及要求 |
|-----------|-----------|-----------|-----------|
| D_CODE | 设备标识 | string | 必填 |
| D_NAME | 设备名称 | string |  |
| D_TYPE | 设备类型 | string | 必填 |
| D_OWNER | 所属公司 | string |  |
| D_GROUP | 所属部门 | guid |  |
| D_USER | 所属用户 | tomsun |  |
| D\_QRCODE_SCALE | 二维码大小 | string |  |

#### 返回字段描述

| 字段名 | 数据类型 | 描述 |
|-----------|-----------|-----------|
| result | string | 请求结果 |
| msg | string | 错误信息 |
| ID | int | 设备ID |
| D_CODE | string | 设备标识 |
| D_NAME | string | 设备名称 |
| D_QRCODE | string | 设备二维码地址 |
| D_QRCODE_SCALE | string | 设备二维码大小 |
| D_CONMMENT | string | 备注 |
| D_LAST_TIME | DateTime | 上次更改时间 |
| D_TYPE | string | 设备类型 |
| D_GROUP | guid | 所属组 |
| D_USER | string | 所属用户 |
| D_OWNER | string | 所属公司 |
| D_STATUS | string | 设备状态 |
| CREATE_USER | string | 创建人 |
| CREATE_USER_NAME | string | 创建人全名 |
| CREATE_TIME | DateTime | 创建时间 |

#### 补充说明

无
