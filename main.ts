/**
 * For maze car's use only
 * Maze car direction options
 */
enum MazeCarDirection { FRONT, BACK, LEFT, RIGHT }


//% weight=60
//% color=#1c4980 
//% icon="\uf2db" 
//% block="PKS Drivers"
namespace pksdriver {

    const PCA9685_ADDRESS = 0x40
    const MODE = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06

    /**
     * The user can select the 8 steering gear controller.
     */
    export enum PKSDriverServos {
        S1 = 0x08,
        S2 = 0x07,
        S3 = 0x06,
        S4 = 0x05,
        S5 = 0x04,
        S6 = 0x03,
        S7 = 0x02,
        S8 = 0x01
    }

    /**
     * The user selects the 4-way dc motor.
     */
    export enum PKSDriverMotors {
        M1 = 0x1,
        M2 = 0x2,
        M3 = 0x3,
        M4 = 0x4
    }

    /**
     * the motor rotation direction
     */
    export enum PKSDriverDir {
        //% blockId="pksdriver_CW" block="CW"
        CW = 1,
        //% blockId="pksdriver_CCW" block="CCW"
        CCW = -1
    }

    let initialized = false

    /**
     * initalize PCA9685
     */
    function initPCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE, 0x00)
        setFreq(50);
        initialized = true
    }

    /**
     * Read data from I2C device
     * @param addr I2C device address  
     * @param reg Register address
     * @returns data read from device
     */
    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    /**
     * Write data to I2C device
     * @param addr I2C device address  
     * @param reg Register address
     * @param value Value to write 
     */
    function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    /**
     * Set PWM frequency for PCA9685
     * @param freq Frequency in Hz (default 50)
     */
    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval;//Math.floor(prescaleval + 0.5);
        let oldmode = i2cRead(PCA9685_ADDRESS, MODE);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(PCA9685_ADDRESS, MODE, newmode); // go to sleep
        i2cWrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(PCA9685_ADDRESS, MODE, oldmode);
        control.waitMicros(5000);
        i2cWrite(PCA9685_ADDRESS, MODE, oldmode | 0xa1);
    }

    /**
     * Set PWM value for a channel on PCA9685
     * @param channel PWM channel (0-15)
     * @param on On time
     * @param off Off time
     */
    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

    /**
     * Steering gear control function 
     * @param idnex S1~S8.
     * @param degree 0°~180°.
    */
    //% blockId=pksdriver_motor_servo block="servo|%index|degree|%degree" subcategory="Edu Kit"
    //% group="Servo"
    //% weight=100
    //% degree.min=0 degree.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function servo(index: PKSDriverServos, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz
        let v_us = (degree * 1800 / 180 + 600) // 0.6ms ~ 2.4ms
        let value = v_us * 4096 / 20000
        setPwm(8 - index, 0, value)
    }


    /**
     * Steering gear control function 
     * @param idnex S1~S8.
     * @param degree 0°~180°.
     */ 
    //% blockId=pksdriver_smart_servo block="smart servo|%index|degree|%degree" subcategory="Smart Living"
    //% group="Servo"
    //% weight=99
    //% degree.min=0 degree.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function smartServo(index: PKSDriverServos, degree: number): void {
        servo(index, degree)
    }

    /**
     * set servo off
     * @param idnex S1~S8.
    */
    //% blockId=pksdriver_motor_servoOff block="servo off|%index" subcategory="Edu Kit"
    //% group="Servos"
    //% weight=99
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function servoOff(index: PKSDriverServos): void {
        if (!initialized) {
            initPCA9685()
        }
        setPwm(8 - (index), 0, 0)
    }

    /**
     * set servo on
     * @param index S1~S8.
    */
    //% blockId=pksdriver_motor_servoOn block="servo on|%index" subcategory="Edu Kit"
    //% group="Servos"
    //% weight=98
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function servoOn(index: PKSDriverServos): void {
        if (!initialized) {
            initPCA9685()
        }
        setPwm(8 - (index), 0, 150)
    }

    /**
     * Execute a motor
     * @param index M1~M4.
     * @param dir CW/CCW
     * @param speed speed(0~255).
    */
    //% weight=130
    //% blockId=pksdriver_motor_MotorRun block="motor|%index|dir|%dir|speed|%speed" subcategory="Edu Kit"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% group="Motors"
    export function motorRun(index: PKSDriverMotors, dir: PKSDriverDir, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 16 * dir; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pn = (index - 1) * 2 + 8
        let pp = (index - 1) * 2 + 8 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }


    /**
     * Execute a motor 
     * @param index M1~M4.
     * @param dir CW/CCW
     * @param speed speed(0~255).
     */
    //% weight=130
    //% blockId=pksdriver_maze_motor_MotorRun block="motor|%index|dir|%dir|speed|%speed" subcategory="Maze Car"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% group="Motors"
    export function mazeMotorRun(index: PKSDriverMotors, dir: PKSDriverDir, speed: number): void {
        motorRun(index, dir, speed);
    }


    /**
     * Stop the dc motor.
     * @param index M1~M4
    */
    //% weight=129
    //% blockId=pksdriver_motor_motorStop block="motor stop|%index" subcategory="Edu Kit"
    //% group="Motors"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function motorStop(index: PKSDriverMotors) {
        if (!initialized) {
            initPCA9685()
        }
        if (index > 4 || index <= 0)
            return
        let pn = (index - 1) * 2 + 8
        let pp = (index - 1) * 2 + 8 + 1
        setPwm(pn, 0, 0);
        setPwm(pp, 0, 0);
    }

    /**
     * Stop all motors
    */
    //% weight=128
    //% blockId=pksdriver_motor_motorStopAll block="motor stop all" subcategory="Edu Kit"
    //% group="Motors"
    export function motorStopAll(): void {
        for (let idx = 1; idx <= 4; idx++) {
            motorStop(idx);
        }
    }

    /**
    * Stop all motors
    */
    //% weight=128
    //% blockId=pksdriver_maze_motor_motorStopAll block="motor stop all" subcategory="Maze Car"
    //% group="Motors"
    export function mazeMotorStopAll(): void {
        motorStopAll();
    }

    /**
     * Switch light on 
     * @param index M1~M4.
     */
    //% weight=90
    //% blockId=pksdriver_light_lighton block="light on|%index" subcategory="Smart Living"
    //% group="Grow Lights"
    export function lightOn(index: PKSDriverMotors): void {
        motorRun(index, 1, 255);
    }

    /**
     * Switch fan on
     * @param index M1~M4. 
     */
    //% weight=90
    //% blockId=pksdriver_fan_fanon block="fan on|%index" subcategory="Smart Living"
    //% group="Fan"
    export function fanOn(index: PKSDriverMotors): void {
        lightOn(index);
    }

    /**
     * Switch light off
     * @param index M1~M4.
     */
    //% weight=90
    //% blockId=pksdriver_light_lightoff block="light off|%index" subcategory="Smart Living"
    //% group="Grow Lights"
    export function lightOff(index: PKSDriverMotors) {
        motorStop(index);
    }


    /**
     * Switch fan off
     * @param index M1~M4.
     */
    //% weight=90
    //% blockId=pksdriver_fan_fanoff block="fan off|%index" subcategory="Smart Living"
    //% group="Fan"
    export function fanOff(index: PKSDriverMotors) {
        lightOff(index);
    }


    /**
     * Compound eye sensor data types
     */
    export enum PKSDriverCompoundEyeData {
        //% block="eye_1"
        Ir_1,
        //% block="eye_2"
        Ir_2,
        //% block="eye_3"
        Ir_3,
        //% block="eye_4"
        Ir_4,
        //% block="eye_5"
        Ir_5,
        //% block="eye_6"
        Ir_6,
        //% block="eye_7"
        Ir_7,
        //% block="eye_8"
        Ir_8,
        //% block="eye_9"
        Ir_9,
        //% block="eye_10"
        Ir_10,
        //% block="eye_11"
        Ir_11,
        //% block="eye_12"
        Ir_12,
        //% block="max_eye_value"
        //% weight=99
        MaxEyeValue,
        //% block="max_eye"
        //% weight=100
        MaxEye,
        //% block="angle"
        //% weight=98
        Angle,
        //% block="mode"
        Mode
    }

    /**
     * Reads data from the compound eye sensor.
     * @param compound_eye_data The type of data to read
     * @returns sensor value, -1 if there is error
     */
    //% blockId=pksdriver_compoundEye block="compound eye $compound_eye_data"  subcategory="Soccer Robot"
    //% group="Compound Eye"
    //% weight=50
    export function compoundEyeRead(compound_eye_data: PKSDriverCompoundEyeData): number {
        pins.i2cWriteNumber(
            0x13,
            compound_eye_data,
            NumberFormat.UInt8LE,
            false
        )
        let temp = pins.i2cReadNumber(0x13, NumberFormat.UInt8LE, false);
        if (temp == 255) {
            return -1;
        } else if (compound_eye_data == PKSDriverCompoundEyeData.Angle) {
            temp *= 2;
        } else if (compound_eye_data == PKSDriverCompoundEyeData.MaxEye) {
            temp += 1;
        }
        return temp;
    }


    interface Aht20Reading {
        humidity: number
        temperature: number
    }

    class Aht20Sensor {
        private address: number;

        constructor(address: number = 0x38) {
            this.address = address;
        }

        initialize(): Aht20Sensor {
            const buf = pins.createBuffer(3);
            buf[0] = 0xbe;
            buf[1] = 0x08;
            buf[2] = 0x00;
            pins.i2cWriteBuffer(this.address, buf, false);
            basic.pause(10);

            return this;
        }

        triggerMeasurement(): Aht20Sensor {
            const buf = pins.createBuffer(3);
            buf[0] = 0xac;
            buf[1] = 0x33;
            buf[2] = 0x00;
            pins.i2cWriteBuffer(this.address, buf, false);
            basic.pause(80);

            return this;
        }

        getState(): { busy: boolean, calibrated: boolean } {
            const buf = pins.i2cReadBuffer(this.address, 1, false);
            const busy = buf[0] & 0x80 ? true : false;
            const calibrated = buf[0] & 0x08 ? true : false;

            return { busy: busy, calibrated: calibrated };
        }

        read(): Aht20Reading | undefined {
            const buf = pins.i2cReadBuffer(this.address, 7, false);

            const crc8 = Aht20Sensor.calcCrc8(buf, 0, 6);
            if (buf[6] != crc8) return undefined;

            const humidity = ((buf[1] << 12) + (buf[2] << 4) + (buf[3] >> 4)) * 100 / 1048576;
            const temperature = (((buf[3] & 0x0f) << 16) + (buf[4] << 8) + buf[5]) * 200 / 1048576 - 50;

            return { humidity: humidity, temperature: temperature };
        }

        private static calcCrc8(buf: Buffer, offset: number, size: number): number {
            let crc8 = 0xff;
            for (let i = 0; i < size; ++i) {
                crc8 ^= buf[offset + i];
                for (let j = 0; j < 8; ++j) {
                    if (crc8 & 0x80) {
                        crc8 <<= 1;
                        crc8 ^= 0x31;
                    }
                    else {
                        crc8 <<= 1;
                    }
                    crc8 &= 0xff;
                }
            }

            return crc8;
        }
    }


    /**
     * Reads humidity and temperature from the AHT20 sensor.
     * @param sensor The AHT20 sensor instance
     * @returns humidity and temperature 
     */
    function readAht20(sensor: Aht20Sensor): Aht20Reading | undefined {
        if (!sensor.getState().calibrated) {
            sensor.initialize();
            if (!sensor.getState().calibrated) return undefined;
        }

        sensor.triggerMeasurement();
        for (let i = 0; ; ++i) {
            if (!sensor.getState().busy) break;
            if (i >= 500) return undefined;
            basic.pause(10);
        }

        return sensor.read();
    }

    /**
     * Read temperature in Celsius from AHT20 sensor
     * @returns temperature in °C
     */
    //% group="Temperature and Humidity (AHT20)"  subcategory="Smart Living"
    //% block="read temperature(°C))"
    //% weight=3
    export function aht20ReadTemperatureC(): number {
        const sensor = new Aht20Sensor();
        const val = readAht20(sensor);
        if (!val) return NaN;

        return val.temperature;
    }

    /**
     * Read temperature in Fahrenheit from AHT20 sensor
     * @returns temperature in °F
     */
    //% group="Temperature and Humidity (AHT20)" subcategory="Smart Living"
    //% block="read temperature(°F))"
    //% weight=2
    export function aht20ReadTemperatureF(): number {
        const sensor = new Aht20Sensor();
        const val = readAht20(sensor);
        if (!val) return NaN;

        return val.temperature * 9 / 5 + 32;
    }

    /**
     * Read humidity from AHT20 sensor
     * @returns humidity percentage
     */
    //% block="read humidity" subcategory="Smart Living"
    //% group="Temperature and Humidity (AHT20)" 
    //% weight=1
    export function aht20ReadHumidity(): number {
        const sensor = new Aht20Sensor();
        const val = readAht20(sensor);
        if (!val) return NaN;

        return val.humidity;
    }

    let _temperature: number = -999.0
    let _humidity: number = -999.0
    let _temptype: tempType = tempType.celsius
    let _readSuccessful: boolean = false
    let _sensorresponding: boolean = false

    /**
    * Query data from DHT11/DHT22 sensor. It is also recommended to wait 1 (DHT11) or 2 (DHT22) seconds between each query.
    * @param DHT DHT type (DHT11 or DHT22)
    * @param dataPin Digital pin for data
    * @param pullUp Enable pin pull up
    * @param serialOutput Enable serial output
    * @param wait Wait 2 seconds after query
    */
    //% block="query $DHT|data pin $dataPin|pin pull up $pullUp|serial output $serialOutput|wait 2 sec after query $wait"
    //% pullUp.defl=true
    //% serialOutput.defl=false
    //% wait.defl=true
    //% blockExternalInputs=true
    //% weight=100
    //% subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function queryData(DHT: DHTtype, dataPin: DigitalPin, pullUp: boolean, serialOutput: boolean, wait: boolean) {
        dht11_dht22.queryData(DHT, dataPin, pullUp, serialOutput, wait)
    }

    /**
    * Read humidity/temperature data from lastest query of DHT11/DHT22
    * @param data Data type (humidity or temperature)
    * @returns the requested data value
    */
    //% weight=99
    //% block="read $data" subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function readData(data: dataType): number {
        return dht11_dht22.readData(data)
    }

    /**
    * Select temperature type (Celsius/Fahrenheit)
    * @param temp 
    */
    //% block="temperature type: $temp" subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    //% weight=98
    export function selectTempType(temp: tempType) {
        dht11_dht22.selectTempType(temp)
    }

    /**
    * Determind if last query is successful (checksum ok)
    * @returns true if successful
    */
    //% block="last query successful?" subcategory="Smart Living"
    //% weight=97
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function readDataSuccessful(): boolean {
        return dht11_dht22.readDataSuccessful()
    }

    /**
    * Determind if sensor responded successfully (not disconnected, etc) in last query
    * @returns true if successful
    */
    //% block="last query sensor responding?" subcategory="Smart Living"
    //% weight=96
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function sensorrResponding(): boolean {
        return dht11_dht22.sensorrResponding()
    }


    
    /**
     * DS1302 RTC class
     */
    // Create instance of DS1302RTC
    let _rtc = new DS1302.DS1302RTC();

    /**
     * get Year
     * @return year
     */
    //% blockId="pksdriver_DS1302_get_year" block="%ds|get year" subcategory="Smart Living"
    //% weight=80 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    export function getYear(): number {
        return _rtc.getYear();
    }

    /**
     * set year
     * @param dat is the Year will be set, eg: 2018
     */
    //% blockId="pksdriver_DS1302_set_year" block="%ds|set year %dat" subcategory="Smart Living"
    //% weight=81 blockGap=8
    //% group="Date and Time"
    //% parts="DS1302"
    export function setYear(dat: number): void {
        _rtc.setYear(dat);
    }

    /**
     * get Month
     * @returns month
     */
    //% blockId="pksdriver_DS1302_get_month" block="%ds|get month" subcategory="Smart Living"
    //% weight=78 blockGap=8
    //% group="Date and Time"
    //% parts="DS1302"
    export function getMonth(): number {
        return _rtc.getMonth();
    }

    /**
     * set month
     * @param dat is Month will be set.  eg: 2
     */
    //% blockId="pksdriver_DS1302_set_month" block="%ds|set month %dat" subcategory="Smart Living"
    //% weight=79 blockGap=8
    //% group="Date and Time"
    //% parts="DS1302"
    //% dat.min=1 dat.max=12
    export function setMonth(dat: number): void {
        _rtc.setMonth(dat);
    }

    /**
     * get Day
     * @returns day
     */
    //% blockId="pksdriver_DS1302_get_day" block="%ds|get day" subcategory="Smart Living"
    //% weight=76 blockGap=8
    //% group="Date and Time"
    //% parts="DS1302"
    export function getDay(): number {
        return _rtc.getDay();
    }

    /**
     * set day
     * @param dat is the Day will be set, eg: 15
     */
    //% blockId="pksdriver_DS1302_set_day" block="%ds|set day %dat" subcategory="Smart Living"
    //% weight=77 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    //% dat.min=1 dat.max=31
    export function setDay(dat: number): void {
        _rtc.setDay(dat);
    }

    /**
     * get Week Day
     * @returns weekday
     */
    //% blockId="pksdriver_DS1302_get_weekday" block="%ds|get weekday" subcategory="Smart Living"
    //% weight=74 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    export function getWeekday(): number {
        return _rtc.getWeekday();
    }

    /**
     * set weekday
     * @param dat is the Week Day will be set, eg: 4
     */
    //% blockId="pksdriver_DS1302_set_weekday" block="%ds|set weekday %dat" subcategory="Smart Living"
    //% weight=75 blockGap=8
    //% parts="DS1302"
    //% dat.min=1 dat.max=7
    //% group="Date and Time"
    export function setWeekday(dat: number): void {
        _rtc.setWeekday(dat);
    }

    /**
     * get Hour
     */
    //% blockId="pksdriver_DS1302_get_hour" block="%ds|get hour" subcategory="Smart Living"
    //% weight=72 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    export function getHour(): number {
        return _rtc.getHour();
    }

    /**
     * set hour
     * @param dat is the Hour will be set, eg: 0
     */
    //% blockId="pksdriver_DS1302_set_hour" block="%ds|set hour %dat" subcategory="Smart Living"
    //% weight=73 blockGap=8
    //% parts="DS1302"
    //% dat.min=0 dat.max=23
    //% group="Date and Time"
    export function setHour(dat: number): void {
        _rtc.setHour(dat);
    }

    /**
     * get Minute
     * @returns minute
     */
    //% blockId="pksdriver_DS1302_get_minute" block="%ds|get minute" subcategory="Smart Living"
    //% weight=70 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    export function getMinute(): number {
        return _rtc.getMinute();
    }

    /**
     * set minute
     * @param dat is the Minute will be set, eg: 0
     */
    //% blockId="pksdriver_DS1302_set_minute" block="%ds|set minute %dat" subcategory="Smart Living"
    //% weight=71 blockGap=8
    //% parts="DS1302"
    //% dat.min=0 dat.max=59
    //% group="Date and Time"
    export function setMinute(dat: number): void {
        _rtc.setMinute(dat);
    }

    /**
     * get Second
     * @returns second
     */
    //% blockId="pksdriver_DS1302_get_second" block="%ds|get second" subcategory="Smart Living"
    //% weight=67 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    export function getSecond(): number {
        return _rtc.getSecond();
    }

    /**
     * set second
     * @param dat is the Second will be set, eg: 0
     */
    //% blockId="pksdriver_DS1302_set_second" block="%ds|set second %dat" subcategory="Smart Living"
    //% weight=68 blockGap=8
    //% parts="DS1302"
    //% dat.min=0 dat.max=59
    //% group="Date and Time"
    export function setSecond(dat: number): void {
        _rtc.setSecond(dat);
    }

    /**
     * set Date and Time
     * @param year is the Year will be set, eg: 2018
     * @param month is the Month will be set, eg: 2
     * @param day is the Day will be set, eg: 15
     * @param weekday is the Weekday will be set, eg: 4
     * @param hour is the Hour will be set, eg: 0
     * @param minute is the Minute will be set, eg: 0
     * @param second is the Second will be set, eg: 0
     */
    //% blockId="pksdriver_DS1302_set_DateTime" block="%ds|set date and time: year %year|month %month|day %day|weekday %weekday|hour %hour|minute %minute|second %second" subcategory="Smart Living"
    //% weight=50 blockGap=8
    //% parts="DS1302"
    //% year.min=2000 year.max=2100
    //% month.min=1 month.max=12
    //% day.min=1 day.max=31
    //% weekday.min=1 weekday.max=7
    //% hour.min=0 hour.max=23
    //% minute.min=0 minute.max=59
    //% second.min=0 second.max=59
    //% group="Date and Time"
    export function DateTime(year: number, month: number, day: number, weekday: number, hour: number, minute: number, second: number): void {
        _rtc.DateTime(year, month, day, weekday, hour, minute, second)
    }

    /**
     * start ds1302 RTC (go on)
     */
    //% blockId="pksdriver_DS1302_start" block="%ds|start RTC" subcategory="Smart Living"
    //% weight=41 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    export function start() {
        _rtc.start()
    }

    /**
     * pause ds1302 RTC
     */
    //% blockId="pksdriver_DS1302_pause" block="%ds|pause RTC" subcategory="Smart Living"
    //% weight=40 blockGap=8
    //% parts="DS1302"
    //% group="Date and Time"
    export function pause() {
        _rtc.pause();
    }

    /**
     * read RAM
     * @param reg RAM register address
     * @returns value read from RAM
     */
    //% blockId="pksdriver_DS1302_read_ram" block="%ds|read ram %reg" subcategory="Smart Living"
    //% weight=43 blockGap=8
    //% parts="DS1302"
    //% reg.min=0 reg.max=30
    //% group="Date and Time"
    export function readRam(reg: number): number {
        return _rtc.readRam(reg);
    }

    /**
     * write RAM
     * @param reg RAM register address
     * @param dat data to write
     */
    //% blockId="pksdriver_DS1302_write_ram" block="%ds|write ram %reg|with %dat" subcategory="Smart Living"
    //% weight=42 blockGap=8
    //% parts="DS1302"
    //% reg.min=0 reg.max=30
    //% group="Date and Time"
    export function writeRam(reg: number, dat: number) {
        _rtc.writeRam(reg, dat);
    }

    /**
     * create a DS1302 object.
     * @param clk the CLK pin for DS1302, eg: DigitalPin.P13
     * @param dio the DIO pin for DS1302, eg: DigitalPin.P14
     * @param cs the CS pin for DS1302, eg: DigitalPin.P15
     */
    //% weight=95 blockGap=8
    //% blockId="pksdriver_DS1302_create" block="CLK %clk|DIO %dio|CS %cs" subcategory="Smart Living"
    export function create(clk: DigitalPin, dio: DigitalPin, cs: DigitalPin): DS1302.DS1302RTC {
        return DS1302.create(clk, dio, cs);
    }




    /**
     * Initialize MPU6050
     */
    //% block="initialize MPU6050" subcategory="Edu Kit"
    //% group="Acceleration"
    //% weight=100
    export function initMPU6050() {
        SENMPU6050.initMPU6050();
    }

    /**
      * Get gyroscope values
      * @param axis which axis to read 
      * @param sensitivity gyroscope sensitivity setting (rad/s)
      * @return gyroscope value in rad/s
      */
    //% block="gyroscope value of %axisXYZ axis with %gyroSen sensitivity (Unit: rad/s)" subcategory="Edu Kit"
    //% group="Acceleration"
    //% weight=99
    export function gyroscope(axis: axisXYZ, sensitivity: gyroSen): number {
        return SENMPU6050.gyroscope(axis, sensitivity)
    }

    /**
     * Get rotation of the corresponding Axis
     * @param axis select axis
     * @param sensitivity accelerator sensitivity setting 
     * @returns angle in Degree 
     */
    //% block="angle of %xaxisXYZ axis with %accelSen sensitivity (Unit: Degrees)" subcategory="Edu Kit"
    //% group="Acceleration"
    //% weight=98
    export function axisRotation(axis: axisXYZ, sensitivity: accelSen): number {
        return SENMPU6050.axisRotation(axis, sensitivity)
    }

    /**
     * Get acceleration of the corresponding Axis
     * @param axis select axis
     * @param sensitivity accelerator sensitivity setting
     * @returns acceleration
     */
    //% block="acceleration of %xaxisXYZ axis with %accelSen sensitivity (Unit: g)" subcategory="Edu Kit"
    //% group="Acceleration"
    //% weight=97
    export function axisAcceleration(axis: axisXYZ, sensitivity: accelSen): number {
        return SENMPU6050.axisAcceleration(axis, sensitivity);
    }

    /**
     * Get temperature
     * @returns temperature 
     */
    //% block="temperature (Unit: Celsius)" subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    //% weight=96
    export function readTemperature(): number {
        return SENMPU6050.readTemperature();
    }

    /**
     * Compass I2C register addresses
     */
    enum PKSDriverCompass {
        BOARD_ID = 0x08,
        //  Compass     (0x40 - 0x5f) + 6 bytes
        ACC_RAW = 0x40,   // 6  (0-5)
        GYR_RAW = 0x46,   // 6  (6-b)
        MAG_RAW = 0x4c,   // 6  (c-2)

        GET_ROLL = 0x54,   // 2byte
        GET_YAW = 0x56,   // 2byte
        GET_PITCH = 0x58,   // 2byte

        MAG_CENT = 0x5a,   // xxyyzz
        MAG_DATA = 0x3a,   // xxyyzz

        WRI_REG = 0x20,   // write reg

    };

    /**
     * Get ultrasonic distance 
     * @returns distance in mm
     */
    //% block="get_dist (Unit: mm)" subcategory="Maze Car"
    //% group="Ultrasound"
    //% weight=70
    export function ultraResult(): number {
        let dist = 0;
        pins.i2cWriteNumber(0x57, 0x01, NumberFormat.UInt8BE, false);
        basic.pause(100);
        let ul_raw = pins.i2cReadBuffer(0x57, pins.sizeOf(NumberFormat.UInt8LE) * 3, false);
        dist = ul_raw[0] * 65536 + ul_raw[1] * 256 + ul_raw[2];
        dist /= 1000;
        return dist;
    }

    /**
    * Compass read function, to get the yaw angle
    * @returns yaw angle in degrees
    */
    //% block="get_yaw (Unit: deg)" subcategory="Soccer Robot"
    //% group="Compass"
    //% weight=70
    export function compassGetYaw(): number {
        let yaw_ang = 0;
        pins.i2cWriteNumber(PKSDriverCompass.BOARD_ID, PKSDriverCompass.GET_YAW, NumberFormat.UInt8BE, false);
        let compass_raw = pins.i2cReadBuffer(PKSDriverCompass.BOARD_ID, 2, false);
        yaw_ang = compass_raw[0] & 0xff;
        yaw_ang |= compass_raw[1] << 8;
        yaw_ang /= 100;
        return yaw_ang;
    }

    /**
     * Select a direction for maze car
     * @param wantedDirection FRONT, BACK, LEFT or RIGHT
     * @returns the selected direction 
     */
    //% block="direction $wantedDirection" subcategory="Maze Car"
    //% group="Directions"
    //% weight=70
    export function chooseDirection(wantedDirection: MazeCarDirection): MazeCarDirection {
        return wantedDirection;
    }
    
    /**
     * Color sensor I2C addresses and commands
     */
    enum PKSDriverColor {
        //i2c addr
        ADDR = 0x11,
        //data commend addr
        COLOR = 0x01,
        RGB = 0x08,
        RGBC = 0x02,
        HSL = 0x03,
    }

    //Color sensor output c data type, just for reference
    //////////////////////////////////////////////////
    //typedef struct{                               //
    //    uint32_t  c;      //[0-65536]             //                
    //    uint32_t  r;                              //
    //    uint32_t  g;                              //
    //    uint32_t  b;                              //
    //} rgbc_t; //RGBC                              //
    //                                              //
    //typedef struct{                               //
    //    uint16_t h;       //[0,360]               //                
    //    uint8_t  s;       //[0,100]               //                
    //    uint8_t  l;       //[0,100]               //                
    //} hsl_t;  //HSL                               //
    //                                              //    
    //typedef struct {                              //
    //    uint8_t r;                                //
    //    uint8_t g;                                //
    //    uint8_t b;                                //
    //} rgb_t;                                      //    
    //////////////////////////////////////////////////


    /**
     * Color Sensor
     */
    export enum PKSDriverRGB {
        //% block="red_value"
        R,
        //% block="green_value"
        G,
        //% block="blue_value"
        B
    }

    /**
     * RGBC color sensor values
     */
    export enum PKSDriverRGBC {
        //% block="clear_light_value"
        C,
        //% block="red_light_value"
        R,
        //% block="green_light_value"
        G,
        //% block="blue_light_value"
        B
    }

    /**
     * HSL color values
     */
    export enum PKSDriverHSL {
        //% block="hue"
        H,
        //% block="saturation"
        S,
        //% block="lightness"
        L
    }

    /**
     * Basic color types for color sensor
     */
    export enum PKSDriverColor_t {
        Black = 0, White, Gray,
        Red, Green, Blue,
        Yellow, Cyan, Purple
    }

    /**
    * HSL read function
    * @param hslchoose H, S, or L
    * @returns the selected value
    */
    //% blockId=pksdriver_readhsl block="readHSL $hslchoose" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=80
    export function readhsl(hslchoose: PKSDriverHSL): number {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.HSL, NumberFormat.UInt8BE, false);
        let hsl = pins.i2cReadBuffer(PKSDriverColor.ADDR, 4, false);
        let temp = [hsl.getNumber(NumberFormat.UInt16LE, 0), //h
        hsl.getNumber(NumberFormat.UInt8LE, 2), //s
        hsl.getNumber(NumberFormat.UInt8LE, 3)] //l
        return temp[hslchoose]
    }

    /**
    * RGB read function
    * @param rgbchoose R, G or B
    * @returns the selected value
    */
    //% blockId=pksdriver_readrgb block="readRGB $rgbchoose" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=60
    export function readrgb(rgbchoose: PKSDriverRGB): number {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.RGB, NumberFormat.UInt8BE, false);
        let rgb = pins.i2cReadBuffer(PKSDriverColor.ADDR, 3, false);
        let temp = [rgb.getNumber(NumberFormat.UInt8LE, 0),  //r
        rgb.getNumber(NumberFormat.UInt8LE, 1),  //g
        rgb.getNumber(NumberFormat.UInt8LE, 2)]  //b
        return temp[rgbchoose]
    }

    /**
    * RGBC read function
    * @param choose C, R, G, or B
    * @returns the selected value
    */
    //% blockId=pksdriver_readrgbc block="readRGBC $choose" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function readrgbc(choose: PKSDriverRGBC): number {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.RGBC, NumberFormat.UInt8BE, false);
        let rgbc = pins.i2cReadBuffer(PKSDriverColor.ADDR, 16, false);
        let temp = [rgbc.getNumber(NumberFormat.UInt32LE, 0),  //c                 
        rgbc.getNumber(NumberFormat.UInt32LE, 4),  //r             
        rgbc.getNumber(NumberFormat.UInt32LE, 8),  //g             
        rgbc.getNumber(NumberFormat.UInt32LE, 12)]  //b
        return temp[choose]
    }

    /**
    * color read function
    * @returns the detected color (Black, White, Gray, Red, Green, Blue, Yellow, Cyan, Purple)
    */
    //% blockId=pksdriver_readcolor block="readColor" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function readColor(): PKSDriverColor_t {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.COLOR, NumberFormat.UInt8BE, false);
        return pins.i2cReadBuffer(PKSDriverColor.ADDR, 1, false).getNumber(NumberFormat.UInt8LE, 0);
    }

    /**
    * check read color
    * @param color The color to check against
    * @returns true if colors matches 
    */
    //% blockId=pksdriver_checkReadColor block="read color is %color_t" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function checkReadColor(color: PKSDriverColor_t): boolean {
        return readColor() == color
    }

    /**
    * check get color
    *  @param color The color to check against
    *  @returns true if colors matches
    */
    //% blockId=pksdriver_checkGetColor block="get color is %color_t" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function checkGetColor(color: PKSDriverColor_t): boolean {
        return getColor() == color
    }

    /**
    * function transfer hsl value to color 
    * @returns color enum value
    */
    //% blockId=pksdriver_getcolor block="getColor" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function getColor(): number {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.HSL, NumberFormat.UInt8BE, false);
        let hsl = pins.i2cReadBuffer(PKSDriverColor.ADDR, 4, false);
        let temp1 = [hsl.getNumber(NumberFormat.UInt16LE, 0), //h
        hsl.getNumber(NumberFormat.UInt8LE, 2), //s
        hsl.getNumber(NumberFormat.UInt8LE, 3)] //l
        if (temp1[PKSDriverHSL.H] > 330 || temp1[PKSDriverHSL.H] < 30) {
            return PKSDriverColor_t.Red
        } else if (temp1[pksdriver.PKSDriverHSL.H] >= 30 && temp1[PKSDriverHSL.H] < 90) {
            return PKSDriverColor_t.Yellow
        } else if (temp1[PKSDriverHSL.H] >= 90 && temp1[PKSDriverHSL.H] < 150) {
            return PKSDriverColor_t.Green
        } else if (temp1[PKSDriverHSL.H] >= 150 && temp1[PKSDriverHSL.H] < 210) {
            return PKSDriverColor_t.Blue//cyan but i find many blue color will sense as cyan color
        } else if (temp1[PKSDriverHSL.H] >= 210 && temp1[PKSDriverHSL.H] < 270) {
            return PKSDriverColor_t.Blue
        } else if (temp1[PKSDriverHSL.H] >= 210 && temp1[PKSDriverHSL.H] < 330) {
            return PKSDriverColor_t.Purple
        }

        return -1

    }

    /**
     * Button options (B1, B2, B3)
     */
    export enum PKSDriverButton {
        //% block="B1"
        B1,
        //% block="B2"
        B2,
        //% block="B3"
        B3
    }

    /**
     * Check if button is pressed  
     * @param Buttoncheck B1 - B3
     * @returns true if button is pressed  
     */
    //% blockId=pksdriver_getbutton block="get button $Buttoncheck" subcategory="Edu Kit"
    //% group="Button"
    //% weight=70
    export function checkButton(Buttoncheck: PKSDriverButton): boolean {
        let buttonvalue = pins.analogReadPin(AnalogPin.P0);
        let button = 0;
        let x = 0;
        let ans = 0;
        if (Buttoncheck == PKSDriverButton.B1) {
            x = 0b100
        }
        else if (Buttoncheck == PKSDriverButton.B2) {
            x = 0b010
        }
        else if (Buttoncheck == PKSDriverButton.B3) {
            x = 0b001
        }
        if (buttonvalue > 912) {
            button = 0;
        } else if (buttonvalue <= 912 && buttonvalue > 747) {
            button = 1;
        } else if (buttonvalue <= 747 && buttonvalue > 631) {
            button = 2;
        } else if (buttonvalue <= 631 && buttonvalue > 547) {
            button = 3;
        } else if (buttonvalue <= 547 && buttonvalue > 482) {
            button = 4;
        } else if (buttonvalue <= 482 && buttonvalue > 431) {
            button = 5;
        } else if (buttonvalue <= 431 && buttonvalue > 390) {
            button = 6;
        } else if (buttonvalue <= 390) {
            button = 7;
        }
        ans = (button & x)


        return ans != 0;
    }


    /**
     * I2C multiplexer channel options
     */
    export enum PKSDriverI2cchannel {
        //% block="C1"
        C1,
        //% block="C2"
        C2,
        //% block="C3"
        C3,
        //% block="C4"
        C4,
        //% block="C5"
        C5,
        //% block="C6"
        C6,
        //% block="C7"
        C7,
        //% block="C8"
        C8
    }

    /**
    * switch I2C multiplexer channel 
    * @param channelselected which channel to select on the I2C multiplexer 
     */
    function switchI2CMultiplexer(channelselected: PKSDriverI2cchannel): void {
        let i2c_multiplexerAddress = 0x70;
        const buf = pins.createBuffer(1);
        if (channelselected == PKSDriverI2cchannel.C1) {
            buf[0] = 0x08
        }
        else if (channelselected == PKSDriverI2cchannel.C2) {
            buf[0] = 0x04
        }
        else if (channelselected == PKSDriverI2cchannel.C3) {
            buf[0] = 0x02
        }
        else if (channelselected == PKSDriverI2cchannel.C4) {
            buf[0] = 0x01
        }
        else if (channelselected == PKSDriverI2cchannel.C5) {
            buf[0] = 0x10
        }
        else if (channelselected == PKSDriverI2cchannel.C6) {
            buf[0] = 0x20
        }
        else if (channelselected == PKSDriverI2cchannel.C7) {
            buf[0] = 0x40
        }
        else if (channelselected == PKSDriverI2cchannel.C8) {
            buf[0] = 0x80
        }
        pins.i2cWriteBuffer(i2c_multiplexerAddress, buf, false);

    }

    /**
     * Switch I2C multiplexer channel (Edu Kit)
     * @param channelselected C1~C8 
     */
    //% blockId=pksdriver_switch_channel_edu block="switch i2cchannel %channelselected" subcategory="Edu Kit"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelEdu(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

    /**
     * Switch I2C multiplexer channel (Maze Car)
     * @param channelselected C1~C8
     */
    //% blockId=pksdriver_switch_channel_maze block="switch i2cchannel %channelselected" subcategory="Maze Car"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelMaze(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

    /**
     * Switch I2C multiplexer channel (Soccer Robot)
     * @param channelselected C1~C8
     */
    //% blockId=pksdriver_switch_channel_soccer block="switch i2cchannel %channelselected" subcategory="Soccer Robot"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelSoccer(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

    /**
     * Switch I2C multiplexer channel (Smart Living)
     * @param channelselected C1~C8
     */
    //% blockId=pksdriver_switch_channel_smart block="switch i2cchannel %channelselected" subcategory="Smart Living"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelSmart(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

}