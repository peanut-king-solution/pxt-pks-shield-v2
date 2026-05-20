// tests go here; this will not be compiled when this package is used as a library

// Motor functions
function test_motorRun() {
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CW, 100)
    basic.pause(500)
    pksdriver.motorStop(pksdriver.PKSDriverMotors.M1)
}

function test_motorRunAll() {
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CW, 80)
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M2, pksdriver.PKSDriverDirection.CCW, 80)
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M3, pksdriver.PKSDriverDirection.CW, 80)
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M4, pksdriver.PKSDriverDirection.CCW, 80)
    basic.pause(1000)
    pksdriver.motorStopAll()
}

function test_motorStop() {
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CW, 100)
    basic.pause(500)
    pksdriver.motorStop(pksdriver.PKSDriverMotors.M1)
}

function test_motorStopAll() {
    pksdriver.motorStopAll()
}

// Maze motor functions
function test_mazeMotorRun() {
    pksdriver.mazeMotorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDirection.CW, 100)
    basic.pause(500)
    pksdriver.mazeMotorStopAll()
}

function test_mazeMotorStopAll() {
    pksdriver.mazeMotorStopAll()
}

// Servo functions
function test_servo() {
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

function test_smartServo() {
    pksdriver.smartServo(pksdriver.PKSDriverServos.S1, 45)
    basic.pause(300)
    pksdriver.smartServo(pksdriver.PKSDriverServos.S1, 135)
}

function test_servoOn() {
    pksdriver.servoOn(pksdriver.PKSDriverServos.S1)
    basic.pause(500)
}

function test_servoOff() {
    pksdriver.servoOff(pksdriver.PKSDriverServos.S1)
    basic.pause(500)
}

// Light and Fan functions
function test_lightOn() {
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M1)
    basic.pause(500)
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M2)
    basic.pause(500)
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M3)
    basic.pause(500)
    pksdriver.lightOn(pksdriver.PKSDriverMotors.M4)
}

function test_lightOff() {
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M1)
    basic.pause(200)
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M2)
    basic.pause(200)
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M3)
    basic.pause(200)
    pksdriver.lightOff(pksdriver.PKSDriverMotors.M4)
}

function test_fanOn() {
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M1)
    basic.pause(500)
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M2)
    basic.pause(500)
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M3)
    basic.pause(500)
    pksdriver.fanOn(pksdriver.PKSDriverMotors.M4)
}

function test_fanOff() {
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M1)
    basic.pause(200)
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M2)
    basic.pause(200)
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M3)
    basic.pause(200)
    pksdriver.fanOff(pksdriver.PKSDriverMotors.M4)
}

// Maze direction function
function test_chooseDirection() {
    let d1 = pksdriver.chooseDirection(MazeCarDirection.FRONT)
    basic.showNumber(d1)
    basic.pause(300)
    let d2 = pksdriver.chooseDirection(MazeCarDirection.BACK)
    basic.showNumber(d2)
    basic.pause(300)
    let d3 = pksdriver.chooseDirection(MazeCarDirection.LEFT)
    basic.showNumber(d3)
    basic.pause(300)
    let d4 = pksdriver.chooseDirection(MazeCarDirection.RIGHT)
    basic.showNumber(d4)
    basic.clearScreen()
}

// Ultra sensor function
function test_ultraResult() {
    let dist = pksdriver.ultrasoundResult()
    basic.showNumber(dist)
    basic.pause(500)
    basic.clearScreen()
}

// Compass functions
function test_compassGetYaw() {
    let yaw = pksdriver.compassGetYaw()
    basic.showNumber(yaw)
    basic.pause(500)
    basic.clearScreen()
}

// Compound eye functions
function test_compoundEyeRead() {
    let maxVal = pksdriver.compoundEyeRead(pksdriver.PKSDriverCompoundEyeData.MaxEyeValue)
    basic.showNumber(maxVal)
    basic.pause(500)
    basic.clearScreen()
}

// Color sensor functions
function test_readhsl() {
    let h = pksdriver.readhsl(pksdriver.PKSDriverHSL.H)
    let s = pksdriver.readhsl(pksdriver.PKSDriverHSL.S)
    let l = pksdriver.readhsl(pksdriver.PKSDriverHSL.L)
    basic.showNumber(h)
    basic.pause(300)
    basic.showNumber(s)
    basic.pause(300)
    basic.showNumber(l)
    basic.clearScreen()
}

function test_readrgb() {
    let r = pksdriver.readrgb(pksdriver.PKSDriverRGB.R)
    let g = pksdriver.readrgb(pksdriver.PKSDriverRGB.G)
    let b = pksdriver.readrgb(pksdriver.PKSDriverRGB.B)
    basic.showNumber(r)
    basic.pause(300)
    basic.showNumber(g)
    basic.pause(300)
    basic.showNumber(b)
    basic.clearScreen()
}

function test_readrgbc() {
    let c = pksdriver.readrgbc(pksdriver.PKSDriverRGBC.C)
    let r = pksdriver.readrgbc(pksdriver.PKSDriverRGBC.R)
    let g = pksdriver.readrgbc(pksdriver.PKSDriverRGBC.G)
    let b = pksdriver.readrgbc(pksdriver.PKSDriverRGBC.B)
    basic.showNumber(c)
    basic.pause(500)
    basic.clearScreen()
}

function test_readColor() {
    let color = pksdriver.readColor()
    basic.showNumber(color)
    basic.pause(500)
    basic.clearScreen()
}

function test_checkReadColor() {
    let isRed = pksdriver.checkReadColor(pksdriver.PKSDriverColor_t.Red)
    let isGreen = pksdriver.checkReadColor(pksdriver.PKSDriverColor_t.Green)
    let isBlue = pksdriver.checkReadColor(pksdriver.PKSDriverColor_t.Blue)
    let isWhite = pksdriver.checkReadColor(pksdriver.PKSDriverColor_t.White)
    let isBlack = pksdriver.checkReadColor(pksdriver.PKSDriverColor_t.Black)
    if (isRed) basic.showString("R")
    if (isGreen) basic.showString("G")
    if (isBlue) basic.showString("B")
    if (isWhite) basic.showString("W")
    if (isBlack) basic.showString("K")
}

function test_getColor() {
    let color = pksdriver.getColor()
    basic.showNumber(color)
    basic.pause(500)
    basic.clearScreen()
}

function test_checkGetColor() {
    let isRed = pksdriver.checkGetColor(pksdriver.PKSDriverColor_t.Red)
    let isGreen = pksdriver.checkGetColor(pksdriver.PKSDriverColor_t.Green)
    let isBlue = pksdriver.checkGetColor(pksdriver.PKSDriverColor_t.Blue)
    if (isRed) basic.showString("R")
    if (isGreen) basic.showString("G")
    if (isBlue) basic.showString("B")
}

// Button functions
function test_checkButton() {
    let b1 = pksdriver.checkButton(pksdriver.PKSDriverButton.B1)
    let b2 = pksdriver.checkButton(pksdriver.PKSDriverButton.B2)
    let b3 = pksdriver.checkButton(pksdriver.PKSDriverButton.B3)
    if (b1) basic.showString("B1")
    if (b2) basic.showString("B2")
    if (b3) basic.showString("B3")
}

// I2C multiplexer functions
function test_switchI2CChannelEdu() {
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C4)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C5)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C6)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C7)
    basic.pause(100)
    pksdriver.switchI2CChannelEdu(pksdriver.PKSDriverI2cchannel.C8)
}

function test_switchI2CChannelMaze() {
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cchannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cchannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cchannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelMaze(pksdriver.PKSDriverI2cchannel.C4)
}

function test_switchI2CChannelSoccer() {
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cchannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cchannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cchannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelSoccer(pksdriver.PKSDriverI2cchannel.C4)
}

function test_switchI2CChannelSmart() {
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cchannel.C1)
    basic.pause(100)
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cchannel.C2)
    basic.pause(100)
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cchannel.C3)
    basic.pause(100)
    pksdriver.switchI2CChannelSmart(pksdriver.PKSDriverI2cchannel.C4)
}

// MPU6050 functions
function test_initMPU6050() {
    pksdriver.initMPU6050()
}

function test_gyroscope() {
    pksdriver.gyroscope(axisXYZ.x, gyroSen.range_250_dps)
    basic.pause(300)
    pksdriver.gyroscope(axisXYZ.y, gyroSen.range_250_dps)
    basic.pause(300)
    pksdriver.gyroscope(axisXYZ.z, gyroSen.range_250_dps)
    basic.pause(300)
    basic.clearScreen()
}

function test_axisRotation() {
    let rx = pksdriver.axisRotation(axisXYZ.x, accelSen.range_2_g)
    let ry = pksdriver.axisRotation(axisXYZ.y, accelSen.range_2_g)
    let rz = pksdriver.axisRotation(axisXYZ.z, accelSen.range_2_g)
    basic.showNumber(rx)
    basic.pause(300)
    basic.showNumber(ry)
    basic.pause(300)
    basic.showNumber(rz)
    basic.clearScreen()
}

function test_axisAcceleration() {
    let ax = pksdriver.axisAcceleration(axisXYZ.x, accelSen.range_2_g)
    let ay = pksdriver.axisAcceleration(axisXYZ.y, accelSen.range_2_g)
    let az = pksdriver.axisAcceleration(axisXYZ.z, accelSen.range_2_g)
    basic.showNumber(ax)
    basic.pause(300)
    basic.showNumber(ay)
    basic.pause(300)
    basic.showNumber(az)
    basic.clearScreen()
}

function test_readTemperatureMPU6050() {
    let temp = pksdriver.readTemperature()
    basic.showNumber(temp)
    basic.pause(500)
    basic.clearScreen()
}

// DHT11/DHT22 functions
function test_queryData() {
    pksdriver.queryData(DHTtype.DHT11, DigitalPin.P0, true, false, true)
}

function test_readData() {
    let humidity = pksdriver.readData(dataType.humidity)
    let tempC = pksdriver.readData(dataType.temperature)
    let tempF = pksdriver.readData(dataType.temperature)
    basic.showNumber(humidity)
    basic.pause(500)
    basic.clearScreen()
}

function test_selectTempType() {
    pksdriver.selectTempType(tempType.celsius)
    pksdriver.selectTempType(tempType.fahrenheit)
}

function test_readDataSuccessful() {
    let success = pksdriver.readDataSuccessful()
    if (success) basic.showString("OK")
    else basic.showString("FAIL")
}

function test_sensorrResponding() {
    let responding = pksdriver.sensorrResponding()
    if (responding) basic.showString("YES")
    else basic.showString("NO")
}

// AHT20 functions
function test_aht20ReadTemperatureC() {
    let tempC = pksdriver.aht20ReadTemperatureC()
    basic.showNumber(tempC)
    basic.pause(500)
    basic.clearScreen()
}

function test_aht20ReadTemperatureF() {
    let tempF = pksdriver.aht20ReadTemperatureF()
    basic.showNumber(tempF)
    basic.pause(500)
    basic.clearScreen()
}

function test_aht20ReadHumidity() {
    let humidity = pksdriver.aht20ReadHumidity()
    basic.showNumber(humidity)
    basic.pause(500)
    basic.clearScreen()
}

// DS1302 RTC functions - requires DS1302 to be created first
function test_DS1302() {
    // Create DS1302 instance (assumes pins P13, P14, P15)
    let rtc = pksdriver.create(DigitalPin.P13, DigitalPin.P14, DigitalPin.P15)
    
    // Set date and time
    pksdriver.DateTime(2024, 1, 15, 1, 12, 30, 0)
    pksdriver.start()
    
    // Get values
    let year = pksdriver.getYear()
    let month = pksdriver.getMonth()
    let day = pksdriver.getDay()
    let weekday = pksdriver.getWeekday()
    let hour = pksdriver.getHour()
    let minute = pksdriver.getMinute()
    let second = pksdriver.getSecond()
    
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
    pksdriver.setYear(2024)
    pksdriver.setMonth(6)
    pksdriver.setDay(20)
    pksdriver.setWeekday(4)
    pksdriver.setHour(8)
    pksdriver.setMinute(30)
    pksdriver.setSecond(45)
    
    // Test start/pause
    pksdriver.pause()
    basic.pause(100)
    pksdriver.start()
    
    // Test RAM read/write
    pksdriver.writeRam(0, 42)
    let ramVal = pksdriver.readRam(0)
    basic.showNumber(ramVal)
    basic.clearScreen()
}

// Run all tests
basic.forever(function () {
    pksdriver.motorStopAll()
    
    test_motorRun()
    test_motorRunAll()
    test_motorStop()
    test_motorStopAll()
    test_mazeMotorRun()
    test_mazeMotorStopAll()
    test_servo()
    test_smartServo()
    test_servoOn()
    test_servoOff()
    test_lightOn()
    test_lightOff()
    test_fanOn()
    test_fanOff()
    test_chooseDirection()
    test_ultraResult()
    test_compassGetYaw()
    test_compoundEyeRead()
    test_readhsl()
    test_readrgb()
    test_readrgbc()
    test_readColor()
    test_checkReadColor()
    test_getColor()
    test_checkGetColor()
    test_checkButton()
    test_switchI2CChannelEdu()
    test_switchI2CChannelMaze()
    test_switchI2CChannelSoccer()
    test_switchI2CChannelSmart()
    test_initMPU6050()
    test_gyroscope()
    test_axisRotation()
    test_axisAcceleration()
    test_readTemperatureMPU6050()
    test_queryData()
    test_readData()
    test_selectTempType()
    test_readDataSuccessful()
    test_sensorrResponding()
    test_aht20ReadTemperatureC()
    test_aht20ReadTemperatureF()
    test_aht20ReadHumidity()
    test_DS1302()
    
    basic.pause(30000)
})