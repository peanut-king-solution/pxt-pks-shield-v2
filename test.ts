// tests go here; this will not be compiled when this package is used as a library

// Motor functions
function testMotorRun() {
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CLOCKWISE, 100)
    basic.pause(500)
    pksdriver.motorStop(pksdriver.PKSDriverMotors.M1)
}

function testMotorRunAll() {
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CLOCKWISE, 80)
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M2, pksdriver.PKSDriverDirection.COUNTERCLOCKWISE, 80)
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M3, pksdriver.PKSDriverDirection.CLOCKWISE, 80)
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M4, pksdriver.PKSDriverDirection.COUNTERCLOCKWISE, 80)
    basic.pause(1000)
    pksdriver.motorStopAll()
}

function testMotorStop() {
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CLOCKWISE, 100)
    basic.pause(500)
    pksdriver.motorStop(pksdriver.PKSDriverMotors.M1)
}

function testMotorStopAll() {
    pksdriver.motorStopAll()
}

// Maze motor functions
function testMazeMotorRun() {
    pksdriver.mazeMotorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CLOCKWISE, 100)
    basic.pause(500)
    pksdriver.mazeMotorStopAll()
}

function testMazeMotorStopAll() {
    pksdriver.mazeMotorStopAll()
}

// Servo functions
function testServo() {
    pksdriver.servo(pksdriver.PKSDriverServos.S1, 0)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S1, 90)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S1, 180)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S2, 90)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S3, 90)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S4, 90)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S5, 90)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S6, 90)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S7, 90)
    basic.pause(300)
    pksdriver.servo(pksdriver.PKSDriverServos.S8, 90)
}

function testSmartServo() {
    pksdriver.smartServo(pksdriver.PKSDriverServos.S1, 45)
    basic.pause(300)
    pksdriver.smartServo(pksdriver.PKSDriverServos.S1, 135)
}

function testServoOn() {
    pksdriver.servoOn(pksdriver.PKSDriverServos.S1)
    basic.pause(500)
}

function testServoOff() {
    pksdriver.servoOff(pksdriver.PKSDriverServos.S1)
    basic.pause(500)
}

// Light and Fan functions
function testLightOn() {
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M1)
    basic.pause(500)
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M2)
    basic.pause(500)
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M3)
    basic.pause(500)
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M4)
}

function testLightOff() {
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M1)
    basic.pause(200)
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M2)
    basic.pause(200)
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M3)
    basic.pause(200)
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M4)
}

function testFanOn() {
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M1)
    basic.pause(500)
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M2)
    basic.pause(500)
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M3)
    basic.pause(500)
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M4)
}

function testFanOff() {
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M1)
    basic.pause(200)
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M2)
    basic.pause(200)
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M3)
    basic.pause(200)
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M4)
}

// Maze direction function
function testChooseDirection() {
    let d1 = pksdriver.chooseDirection(pksdriver.MazeCarDirection.FRONT)
    basic.showNumber(d1)
    basic.pause(300)
    let d2 = pksdriver.chooseDirection(pksdriver.MazeCarDirection.BACK)
    basic.showNumber(d2)
    basic.pause(300)
    let d3 = pksdriver.chooseDirection(pksdriver.MazeCarDirection.LEFT)
    basic.showNumber(d3)
    basic.pause(300)
    let d4 = pksdriver.chooseDirection(pksdriver.MazeCarDirection.RIGHT)
    basic.showNumber(d4)
    basic.clearScreen()
}

// Ultra sensor function
function testUltraResult() {
    let dist = pksdriver.ultrasoundResult()
    basic.showNumber(dist)
    basic.pause(500)
    basic.clearScreen()
}

// Compass functions
function testCompassGetYaw() {
    let yaw = pksdriver.compassGetYaw()
    basic.showNumber(yaw)
    basic.pause(500)
    basic.clearScreen()
}

// Compound eye functions
function testCompoundEyeRead() {
    let maxVal = pksdriver.compoundEyeRead(pksdriver.PKSDriverCompoundEyeData.MaxEyeValue)
    basic.showNumber(maxVal)
    basic.pause(500)
    basic.clearScreen()
}

// Color sensor functions
function testReadHSL() {
    let h = pksdriver.readHSL(pksdriver.PKSDriverHSL.H)
    let s = pksdriver.readHSL(pksdriver.PKSDriverHSL.S)
    let l = pksdriver.readHSL(pksdriver.PKSDriverHSL.L)
    basic.showNumber(h)
    basic.pause(300)
    basic.showNumber(s)
    basic.pause(300)
    basic.showNumber(l)
    basic.clearScreen()
}

function testReadRGB() {
    let r = pksdriver.readRGB(pksdriver.PKSDriverRGB.R)
    let g = pksdriver.readRGB(pksdriver.PKSDriverRGB.G)
    let b = pksdriver.readRGB(pksdriver.PKSDriverRGB.B)
    basic.showNumber(r)
    basic.pause(300)
    basic.showNumber(g)
    basic.pause(300)
    basic.showNumber(b)
    basic.clearScreen()
}

function testReadRGBC() {
    let c = pksdriver.readRGBC(pksdriver.PKSDriverRGBC.C)
    let r = pksdriver.readRGBC(pksdriver.PKSDriverRGBC.R)
    let g = pksdriver.readRGBC(pksdriver.PKSDriverRGBC.G)
    let b = pksdriver.readRGBC(pksdriver.PKSDriverRGBC.B)
    basic.showNumber(c)
    basic.pause(300)
    basic.showNumber(r)
    basic.pause(300)
    basic.showNumber(g)
    basic.pause(300)
    basic.showNumber(b)
    basic.pause(500)
    basic.clearScreen()
}

function testReadColor() {
    let color = pksdriver.readColor()
    basic.showNumber(color)
    basic.pause(500)
    basic.clearScreen()
}

function testCheckReadColor() {
    let isRed = pksdriver.checkReadColor(pksdriver.PKSDriverColorType.Red)
    let isGreen = pksdriver.checkReadColor(pksdriver.PKSDriverColorType.Green)
    let isBlue = pksdriver.checkReadColor(pksdriver.PKSDriverColorType.Blue)
    let isWhite = pksdriver.checkReadColor(pksdriver.PKSDriverColorType.White)
    let isBlack = pksdriver.checkReadColor(pksdriver.PKSDriverColorType.Black)
    if (isRed) basic.showString("R")
    if (isGreen) basic.showString("G")
    if (isBlue) basic.showString("B")
    if (isWhite) basic.showString("W")
    if (isBlack) basic.showString("K")
}

function testGetColor() {
    let color = pksdriver.reAnalysisColor()
    basic.showNumber(color)
    basic.pause(500)
    basic.clearScreen()
}

function testCheckGetColor() {
    let isRed = pksdriver.checkGetColor(pksdriver.PKSDriverColorType.Red)
    let isGreen = pksdriver.checkGetColor(pksdriver.PKSDriverColorType.Green)
    let isBlue = pksdriver.checkGetColor(pksdriver.PKSDriverColorType.Blue)
    if (isRed) basic.showString("R")
    if (isGreen) basic.showString("G")
    if (isBlue) basic.showString("B")
}

// Button functions
function testCheckButton() {
    let b1 = pksdriver.checkButton(pksdriver.PKSDriverButton.B1)
    let b2 = pksdriver.checkButton(pksdriver.PKSDriverButton.B2)
    let b3 = pksdriver.checkButton(pksdriver.PKSDriverButton.B3)
    if (b1) basic.showString("B1")
    if (b2) basic.showString("B2")
    if (b3) basic.showString("B3")
}

// I2C multiplexer functions
function testSwitchI2CChannelEdu() {
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C4)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C5)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C6)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C7)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cChannel.C8)
}

function testSwitchI2CChannelMaze() {
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cChannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cChannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cChannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cChannel.C4)
}

function testSwitchI2CChannelSoccer() {
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cChannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cChannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cChannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cChannel.C4)
}

function testSwitchI2CChannelSmart() {
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cChannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cChannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cChannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cChannel.C4)
}

// MPU6050 functions
function testInitMPU6050() {
    pksdriver.initMPU6050()
}

function testGyroscope() {
    pksdriver.gyroscope(pksdriver.AxisXYZ.X, pksdriver.GyroSen.Range_250_dps)
    basic.pause(300)
    pksdriver.gyroscope(pksdriver.AxisXYZ.Y, pksdriver.GyroSen.Range_250_dps)
    basic.pause(300)
    pksdriver.gyroscope(pksdriver.AxisXYZ.Z, pksdriver.GyroSen.Range_250_dps)
    basic.pause(300)
    basic.clearScreen()
}

function testAxisRotation() {
    let rx = pksdriver.axisRotation(pksdriver.AxisXYZ.X, pksdriver.AccelSen.Range_2_g)
    let ry = pksdriver.axisRotation(pksdriver.AxisXYZ.Y, pksdriver.AccelSen.Range_2_g)
    let rz = pksdriver.axisRotation(pksdriver.AxisXYZ.Z, pksdriver.AccelSen.Range_2_g)
    basic.showNumber(rx)
    basic.pause(300)
    basic.showNumber(ry)
    basic.pause(300)
    basic.showNumber(rz)
    basic.clearScreen()
}

function testAxisAcceleration() {
    let ax = pksdriver.axisAcceleration(pksdriver.AxisXYZ.X, pksdriver.AccelSen.Range_2_g)
    let ay = pksdriver.axisAcceleration(pksdriver.AxisXYZ.Y, pksdriver.AccelSen.Range_2_g)
    let az = pksdriver.axisAcceleration(pksdriver.AxisXYZ.Z, pksdriver.AccelSen.Range_2_g)
    basic.showNumber(ax)
    basic.pause(300)
    basic.showNumber(ay)
    basic.pause(300)
    basic.showNumber(az)
    basic.clearScreen()
}

function testReadTemperatureMPU6050() {
    let temp = pksdriver.readTemperature()
    basic.showNumber(temp)
    basic.pause(500)
    basic.clearScreen()
}

// DHT11/DHT22 functions
function testQueryData() {
    pksdriver.queryData(pksdriver.DHTtype.DHT11, DigitalPin.P0, true, false, true)
}

function testReadData() {
    let humidity = pksdriver.DHTReadData(pksdriver.DataType.Humidity)
    let tempC = pksdriver.DHTReadData(pksdriver.DataType.Temperature)
    let tempF = pksdriver.DHTReadData(pksdriver.DataType.Temperature)
    basic.showNumber(humidity)
    basic.pause(500)
    basic.clearScreen()
}

function testSelectTempType() {
    pksdriver.selectTempType(pksdriver.TempType.Celsius)
    pksdriver.selectTempType(pksdriver.TempType.Fahrenheit)
}

function testReadDataSuccessful() {
    let success = pksdriver.DHTReadDataSuccessful()
    if (success) basic.showString("OK")
    else basic.showString("FAIL")
}

function testSensorResponding() {
    let responding = pksdriver.sensorResponding()
    if (responding) basic.showString("YES")
    else basic.showString("NO")
}

// AHT20 functions
function testAht20ReadTemperatureC() {
    let tempC = pksdriver.aht20ReadTemperatureC()
    basic.showNumber(tempC)
    basic.pause(500)
    basic.clearScreen()
}

function testAht20ReadTemperatureF() {
    let tempF = pksdriver.aht20ReadTemperatureF()
    basic.showNumber(tempF)
    basic.pause(500)
    basic.clearScreen()
}

function testAht20ReadHumidity() {
    let humidity = pksdriver.aht20ReadHumidity()
    basic.showNumber(humidity)
    basic.pause(500)
    basic.clearScreen()
}

// DS1302 RTC functions - requires DS1302 to be created first
function testDS1302() {
    // Create DS1302 instance (assumes pins P13, P14, P15)
    let rtc = pksdriver.create(DigitalPin.P13, DigitalPin.P14, DigitalPin.P15)
    
    // Set date and time
    rtc.dateTime(2024, 1, 15, 1, 12, 30, 0)
    rtc.start()
    
    // Get values
    let year = rtc.year()
    let month = rtc.month()
    let day = rtc.day()
    let weekday = rtc.weekday()
    let hour = rtc.hour()
    let minute = rtc.minute()
    let second = rtc.second()
    
    basic.showNumber(year)
    basic.pause(500)
    basic.showNumber(month)
    basic.pause(500)
    basic.showNumber(day)
    basic.pause(500)
    basic.showNumber(weekday)
    basic.pause(500)
    basic.showNumber(hour)
    basic.pause(500)
    basic.showNumber(minute)
    basic.pause(500)
    basic.showNumber(second)
    basic.clearScreen()
    
    // Test set functions
    rtc.setYear(2024)
    rtc.setMonth(6)
    rtc.setDay(20)
    rtc.setWeekday(4)
    rtc.setHour(8)
    rtc.setMinute(30)
    rtc.setSecond(45)
    
    // Test start/pause
    rtc.pause()
    basic.pause(100)
    rtc.start()
    
    // Test RAM read/write
    rtc.writeRam(0, 42)
    let ramVal = rtc.readRam(0)
    basic.showNumber(ramVal)
    basic.clearScreen()
}

// Run all tests
basic.forever(function () {
    pksdriver.motorStopAll()
    
    testMotorRun()
    testMotorRunAll()
    testMotorStop()
    testMotorStopAll()
    testMazeMotorRun()
    testMazeMotorStopAll()
    testServo()
    testSmartServo()
    testServoOn()
    testServoOff()
    testLightOn()
    testLightOff()
    testFanOn()
    testFanOff()
    testChooseDirection()
    testUltraResult()
    testCompassGetYaw()
    testCompoundEyeRead()
    testReadHSL()
    testReadRGB()
    testReadRGBC()
    testReadColor()
    testCheckReadColor()
    testGetColor()
    testCheckGetColor()
    testCheckButton()
    testSwitchI2CChannelEdu()
    testSwitchI2CChannelMaze()
    testSwitchI2CChannelSoccer()
    testSwitchI2CChannelSmart()
    testInitMPU6050()
    testGyroscope()
    testAxisRotation()
    testAxisAcceleration()
    testReadTemperatureMPU6050()
    testQueryData()
    testReadData()
    testSelectTempType()
    testReadDataSuccessful()
    testSensorResponding()
    testAht20ReadTemperatureC()
    testAht20ReadTemperatureF()
    testAht20ReadHumidity()
    testDS1302()
    
    basic.pause(30000)
})