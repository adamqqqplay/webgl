//
// adamqqq's circle draw function (adamqqq@163.com)
//
function getRad(Angle) {								
    return Math.PI / 180 * Angle
}//将角度转换为弧度

function getEllipsePoint(origin, a, b, theta) {			
    theta = getRad(theta)
    return { "x": origin.x + a * Math.cos(theta), "y": origin.y + b * Math.sin(theta) }
}//获取椭圆的点

function getCirclePoint(origin, r, theta) {				
    return getEllipsePoint(origin, r, r, theta)
}//获取圆的点

function getEllipsePart(origin, a, b, sTheta, fTheta) {	
    var v = new Array()
    var delta = 15
    for (var theta = sTheta; theta < fTheta; theta = theta + delta) {
        var p = getEllipsePoint(origin, a, b, theta)
        var p2 = getEllipsePoint(origin, a, b, theta + delta)
        v.push(p.x, p.y, p2.x, p2.y, origin.x, origin.y)
    }
    return v
}//获取椭圆的一部分

function getEllipse(origin, a, b) {
    return getEllipsePart(origin, a, b, 0, 360)
}//获取椭圆的所有点

function getCirclePart(origin, r, sTheta, fTheta) {
    return getEllipsePart(origin, r, r, sTheta, fTheta)
}//获取圆的一部分

function getCircle(origin, r) {
    return getEllipse(origin, r, r)
}//获取圆的所有点

function getHollowEllipse(origin, a1, b1, a2, b2) {     
    return getHollowEllipsePart(origin, a1, b1, a2, b2, 0, 360)
}//获取一个空心椭圆，origin为原点，a1，b1，b1，b2分别是两个椭圆的长轴和短轴

function getHollowEllipsePart(origin, a1, b1, a2, b2, sTheta, fTheta) {     
    var v = new Array()
    var delta = 1
    for (var theta = sTheta; theta < fTheta; theta = theta + delta) {
        var p1a = getEllipsePoint(origin, a1, b1, theta)
        var p1b = getEllipsePoint(origin, a1, b1, theta + delta)
        var p2a = getEllipsePoint(origin, a2, b2, theta)
        var p2b = getEllipsePoint(origin, a2, b2, theta + delta)
        v.push(p1a.x, p1a.y, p1b.x, p1b.y, p2a.x, p2a.y)
        v.push(p2a.x, p2a.y, p2b.x, p2b.y, p1b.x, p1b.y)
    }
    return v
}//获取一个空心椭圆弧，origin为原点，a1，b1，b1，b2分别是两个椭圆的长轴和短轴

function getHollowCircle(origin, r1, r2) {      
    return getHollowEllipse(origin, r1, r1, r2, r2)
}//获取一个空心圆，origin为原点，r1，r2分别是两个圆的半径
//example: getHollowCircle({ "x": 0, "y": 0 }, 0.7, 0.6)

function getHollowCirclePart(origin, r1, r2, sTheta, fTheta) {      
    return getHollowEllipsePart(origin, r1, r1, r2, r2, sTheta, fTheta)
}//获取一个空心圆弧，origin为原点，r1，r2分别是两个圆的半径
//生成字母C的例子: getHollowEllipsePart({ "x": 0, "y": 0 }, 0.6, 0.66, 0.6/1.3, 0.66/1.3, 60, 300) 