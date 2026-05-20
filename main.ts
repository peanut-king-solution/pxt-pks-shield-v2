
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
     * For maze car's use only
     * Maze car direction options
     */
    export enum MazeCarDirection { FRONT, BACK, LEFT, RIGHT }

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
    export enum PKSDriverDirection {
        //% blockId="pksdriver_CW" block="ClockWise"
        CW = 1,
        //% blockId="pksdriver_CCW" block="CounterClockWise"
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
     * @param index S1~S8.
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
     * @param index S1~S8.
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
     * @param index S1~S8.
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
     * @param direction CW/CCW
     * @param speed speed(0~255).
    */
    //% weight=130
    //% blockId=pksdriver_motor_MotorRun block="motor|%index|direction|%direction|speed|%speed" subcategory="Edu Kit"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% group="Motors"
    export function motorRun(index: PKSDriverMotors, direction: PKSDriverDirection, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 16 * direction; // map 255 to 4096
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
     * @param direction CW/CCW
     * @param speed speed(0~255).
     */
    //% weight=130
    //% blockId=pksdriver_maze_motor_MotorRun block="motor|%index|direction|%direction|speed|%speed" subcategory="Maze Car"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% group="Motors"
    export function mazeMotorRun(index: PKSDriverMotors, direction: PKSDriverDirection, speed: number): void {
        motorRun(index, direction, speed);
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
        //% block="eye 1"
        Ir1,
        //% block="eye 2"
        Ir2,
        //% block="eye 3"
        Ir3,
        //% block="eye 4"
        Ir4,
        //% block="eye 5"
        Ir5,
        //% block="eye 6"
        Ir6,
        //% block="eye 7"
        Ir7,
        //% block="eye 8"
        Ir8,
        //% block="eye 9"
        Ir9,
        //% block="eye 10"
        Ir10,
        //% block="eye 11"
        Ir11,
        //% block="eye 12"
        Ir12,
        //% block="eye max eye value"
        //% weight=99
        MaxEyeValue,
        //% block="eye max eye number"
        //% weight=100
        MaxEye,
        //% block="eye angle"
        //% weight=98
        Angle,
        //% block="eye mode"
        Mode
    }

    /**
     * Reads data from the compound eye sensor.
     * gets -1 if there is error
     * @param compoundEyeData The type of data to read
     */
    //% blockId=pksdriver_compoundEye block="compound $compoundEyeData"  subcategory="Soccer Robot"
    //% group="Compound Eye"
    //% weight=50
    export function compoundEyeRead(compoundEyeData: PKSDriverCompoundEyeData): number {
        pins.i2cWriteNumber(
            0x13,
            compoundEyeData,
            NumberFormat.UInt8LE,
            false
        )
        let temp = pins.i2cReadNumber(0x13, NumberFormat.UInt8LE, false);
        if (temp == 255) {
            return -1;
        } else if (compoundEyeData == PKSDriverCompoundEyeData.Angle) {
            temp *= 2;
        } else if (compoundEyeData == PKSDriverCompoundEyeData.MaxEye) {
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
     */
    //% group="Temperature and Humidity (AHT20)"  subcategory="Smart Living"
    //% block="read temperature (°C)"
    //% weight=3
    export function aht20ReadTemperatureC(): number {
        const sensor = new Aht20Sensor();
        const val = readAht20(sensor);
        if (!val) return NaN;

        return val.temperature;
    }

    /**
     * Read temperature in Fahrenheit from AHT20 sensor
     */
    //% group="Temperature and Humidity (AHT20)" subcategory="Smart Living"
    //% block="read temperature (°F)"
    //% weight=2
    export function aht20ReadTemperatureF(): number {
        const sensor = new Aht20Sensor();
        const val = readAht20(sensor);
        if (!val) return NaN;

        return val.temperature * 9 / 5 + 32;
    }

    /**
     * Read humidity from AHT20 sensor
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

    //*************************************************************************************************//
    //DHT11/DHT22 related code, adapted from https://github.com/alankrantas/pxt-dht11_dht22          //
    //*************************************************************************************************//
    enum DHTtype {
        //% block="DHT11"
        DHT11,
        //% block="DHT22"
        DHT22,
    }

    enum dataType {
        //% block="humidity"
        humidity,
        //% block="temperature"
        temperature,
    }

    enum tempType {
        //% block="Celsius (*C)"
        celsius,
        //% block="Fahrenheit (*F)"
        fahrenheit,
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
        //initialize
        let startTime: number = 0
        let endTime: number = 0
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        let DHTstr: string = (DHT == DHTtype.DHT11) ? "DHT11" : "DHT22"

        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)

        _humidity = -999.0
        _temperature = -999.0
        _readSuccessful = false
        _sensorresponding = false
        startTime = input.runningTimeMicros()

        //request data
        pins.digitalWritePin(dataPin, 0) //begin protocol, pull down pin
        basic.pause(18)
        
        if (pullUp) pins.setPull(dataPin, PinPullMode.PullUp) //pull up data pin if needed
        pins.digitalReadPin(dataPin) //pull up pin
        control.waitMicros(40)
        
        if (pins.digitalReadPin(dataPin) == 1) {
            if (serialOutput) {
                serial.writeLine(DHTstr + " not responding!")
                serial.writeLine("----------------------------------------")
            }

        } else {

            _sensorresponding = true

            while (pins.digitalReadPin(dataPin) == 0); //sensor response
            while (pins.digitalReadPin(dataPin) == 1); //sensor response

            //read data (5 bytes)
            for (let index = 0; index < 40; index++) {
                while (pins.digitalReadPin(dataPin) == 1);
                while (pins.digitalReadPin(dataPin) == 0);
                control.waitMicros(28)
                //if sensor still pull up data pin after 28 us it means 1, otherwise 0
                if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = true
            }

            endTime = input.runningTimeMicros()

            //convert byte number array to integer
            for (let index = 0; index < 5; index++)
                for (let index2 = 0; index2 < 8; index2++)
                    if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

            //verify checksum
            checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
            checksum = resultArray[4]
            if (checksumTmp >= 512) checksumTmp -= 512
            if (checksumTmp >= 256) checksumTmp -= 256
            if (checksum == checksumTmp) _readSuccessful = true

            //read data if checksum ok
            if (_readSuccessful) {
                if (DHT == DHTtype.DHT11) {
                    //DHT11
                    _humidity = resultArray[0] + resultArray[1] / 100
                    _temperature = resultArray[2] + resultArray[3] / 100
                } else {
                    //DHT22
                    let temp_sign: number = 1
                    if (resultArray[2] >= 128) {
                        resultArray[2] -= 128
                        temp_sign = -1
                    }
                    _humidity = (resultArray[0] * 256 + resultArray[1]) / 10
                    _temperature = (resultArray[2] * 256 + resultArray[3]) / 10 * temp_sign
                }
                if (_temptype == tempType.fahrenheit)
                    _temperature = _temperature * 9 / 5 + 32
            }

            //serial output
            if (serialOutput) {
                serial.writeLine(DHTstr + " query completed in " + (endTime - startTime) + " microseconds")
                if (_readSuccessful) {
                    serial.writeLine("Checksum ok")
                    serial.writeLine("Humidity: " + _humidity + " %")
                    serial.writeLine("Temperature: " + _temperature + (_temptype == tempType.celsius ? " *C" : " *F"))
                } else {
                    serial.writeLine("Checksum error")
                }
                serial.writeLine("----------------------------------------")
            }

        }

        //wait 2 sec after query if needed
        if (wait) basic.pause(2000)

    }

    /**
    * Read humidity/temperature data from lastest query of DHT11/DHT22
    * @param data Data type (humidity or temperature)
    */
    //% weight=99
    //% block="read $data" subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function DHTReadData(data: dataType): number {
        return data == dataType.humidity ? _humidity : _temperature
    }

    /**
    * Select temperature type (Celsius/Fahrenheit)
    * @param temp 
    */
    //% block="temperature type: $temp" subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    //% weight=98
    export function selectTempType(temp: tempType) {
        _temptype = temp
    }

    /**
    * Determind if last query is successful (checksum ok)
    */
    //% block="last query successful?" subcategory="Smart Living"
    //% weight=97
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function DHTReadDataSuccessful(): boolean {
        return _readSuccessful
    }

    /**
    * Determind if sensor responded successfully (not disconnected, etc) in last query
    */
    //% block="last query sensor responding?" subcategory="Smart Living"
    //% weight=96
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function sensorResponding(): boolean {
        return _sensorresponding
    }

    //*************************************************************************************************//
    //DHT11/DHT22 related code finished                                                                //
    //*************************************************************************************************//

    



    //*************************************************************************************************//
    //DS1302 RTC related code, adapted from https://github.com/makecode-extensions/ds1302
    //*************************************************************************************************//
    let DS1302_REG_SECOND = 0x80
    let DS1302_REG_MINUTE = 0x82
    let DS1302_REG_HOUR = 0x84
    let DS1302_REG_DAY = 0x86
    let DS1302_REG_MONTH = 0x88
    let DS1302_REG_WEEKDAY = 0x8A
    let DS1302_REG_YEAR = 0x8C
    let DS1302_REG_WP = 0x8E
    let DS1302_REG_CTRL = 0x90
    let DS1302_REG_RAM = 0xC0
    /**
     * DS1302 RTC class
     */

     /**
     * convert a Hex data to Dec
     */
    function HexToDec(dat: number): number {
        return (dat >> 4) * 10 + (dat % 16);
    }

    /**
     * convert a Dec data to Hex
     */
    function DecToHex(dat: number): number {
        return Math.idiv(dat, 10) * 16 + (dat % 10)
    }

    /**
     * DS1302 RTC class
     */
    export class DS1302RTC {
        clk: DigitalPin;
        dio: DigitalPin;
        cs: DigitalPin;

        /**
         * write a byte to DS1302
         */
        write_byte(dat: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.dio, (dat >> i) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
        }

        /**
         * read a byte from DS1302
         */
        read_byte(): number {
            let d = 0;
            for (let i = 0; i < 8; i++) {
                d = d | (pins.digitalReadPin(this.dio) << i);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
            return d;
        }

        /**
         * read reg
         */
        getReg(reg: number): number {
            let t = 0;
            pins.digitalWritePin(this.cs, 1);
            this.write_byte(reg);
            t = this.read_byte();
            pins.digitalWritePin(this.cs, 0);
            return t;
        }

        /**
         * write reg
         */
        setReg(reg: number, dat: number) {
            pins.digitalWritePin(this.cs, 1);
            this.write_byte(reg);
            this.write_byte(dat);
            pins.digitalWritePin(this.cs, 0);
        }

        /**
         * write reg with WP protect
         */
        wr(reg: number, dat: number) {
            this.setReg(DS1302_REG_WP, 0)
            this.setReg(reg, dat)
            this.setReg(DS1302_REG_WP, 0)
        }

        /**
         * get Year
         */
        //% blockId="DS1302_get_year" block="%ds|get year"
        //% weight=80 blockGap=8
        //% parts="DS1302"
        getYear(): number {
            return Math.min(HexToDec(this.getReg(DS1302_REG_YEAR + 1)), 99) + 2000
        }

        /**
         * set year
         * @param dat is the Year will be set, eg: 2018
         */
        //% blockId="DS1302_set_year" block="%ds|set year %dat"
        //% weight=81 blockGap=8
        //% parts="DS1302"
        setYear(dat: number): void {
            this.wr(DS1302_REG_YEAR, DecToHex(dat % 100))
        }

        /**
         * get Month
         */
        //% blockId="DS1302_get_month" block="%ds|get month"
        //% weight=78 blockGap=8
        //% parts="DS1302"
        getMonth(): number {
            return Math.max(Math.min(HexToDec(this.getReg(DS1302_REG_MONTH + 1)), 12), 1)
        }

        /**
         * set month
         * @param dat is Month will be set.  eg: 2
         */
        //% blockId="DS1302_set_month" block="%ds|set month %dat"
        //% weight=79 blockGap=8
        //% parts="DS1302"
        //% dat.min=1 dat.max=12
        setMonth(dat: number): void {
            this.wr(DS1302_REG_MONTH, DecToHex(dat % 13))
        }

        /**
         * get Day
         */
        //% blockId="DS1302_get_day" block="%ds|get day"
        //% weight=76 blockGap=8
        //% parts="DS1302"
        getDay(): number {
            return Math.max(Math.min(HexToDec(this.getReg(DS1302_REG_DAY + 1)), 31), 1)
        }

        /**
         * set day
         * @param dat is the Day will be set, eg: 15
         */
        //% blockId="DS1302_set_day" block="%ds|set day %dat"
        //% weight=77 blockGap=8
        //% parts="DS1302"
        //% dat.min=1 dat.max=31
        setDay(dat: number): void {
            this.wr(DS1302_REG_DAY, DecToHex(dat % 32))
        }

        /**
         * get Week Day
         */
        //% blockId="DS1302_get_weekday" block="%ds|get weekday"
        //% weight=74 blockGap=8
        //% parts="DS1302"
        getWeekday(): number {
            return Math.max(Math.min(HexToDec(this.getReg(DS1302_REG_WEEKDAY + 1)), 7), 1)
        }

        /**
         * set weekday
         * @param dat is the Week Day will be set, eg: 4
         */
        //% blockId="DS1302_set_weekday" block="%ds|set weekday %dat"
        //% weight=75 blockGap=8
        //% parts="DS1302"
        //% dat.min=1 dat.max=7
        setWeekday(dat: number): void {
            this.wr(DS1302_REG_WEEKDAY, DecToHex(dat % 8))
        }

        /**
         * get Hour
         */
        //% blockId="DS1302_get_hour" block="%ds|get hour"
        //% weight=72 blockGap=8
        //% parts="DS1302"
        getHour(): number {
            return Math.min(HexToDec(this.getReg(DS1302_REG_HOUR + 1)), 23)
        }

        /**
         * set hour
         * @param dat is the Hour will be set, eg: 0
         */
        //% blockId="DS1302_set_hour" block="%ds|set hour %dat"
        //% weight=73 blockGap=8
        //% parts="DS1302"
        //% dat.min=0 dat.max=23
        setHour(dat: number): void {
            this.wr(DS1302_REG_HOUR, DecToHex(dat % 24))
        }

        /**
         * get Minute
         */
        //% blockId="DS1302_get_minute" block="%ds|get minute"
        //% weight=72 blockGap=8
        //% parts="DS1302"
        getMinute(): number {
            return Math.min(HexToDec(this.getReg(DS1302_REG_MINUTE + 1)), 59)
        }

        /**
         * set minute
         * @param dat is the Minute will be set, eg: 0
         */
        //% blockId="DS1302_set_minute" block="%ds|set minute %dat"
        //% weight=71 blockGap=8
        //% parts="DS1302"
        //% dat.min=0 dat.max=59
        setMinute(dat: number): void {
            this.wr(DS1302_REG_MINUTE, DecToHex(dat % 60))
        }

        /**
         * get Second
         */
        //% blockId="DS1302_get_second" block="%ds|get second"
        //% weight=70 blockGap=8
        //% parts="DS1302"
        getSecond(): number {
            return Math.min(HexToDec(this.getReg(DS1302_REG_SECOND + 1)), 59)
        }

        /**
         * set second
         * @param dat is the Second will be set, eg: 0
         */
        //% blockId="DS1302_set_second" block="%ds|set second %dat"
        //% weight=69 blockGap=8
        //% parts="DS1302"
        //% dat.min=0 dat.max=59
        setSecond(dat: number): void {
            this.wr(DS1302_REG_SECOND, DecToHex(dat % 60))
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
        //% blockId="DS1302_set_DateTime" block="%ds|set Date and Time: Year %year|Month %month|Day %day|WeekDay %weekday|Hour %hour|Minute %minute|Second %second"
        //% weight=50 blockGap=8
        //% parts="DS1302"
        //% year.min=2000 year.max=2100
        //% month.min=1 month.max=12
        //% day.min=1 day.max=31
        //% weekday.min=1 weekday.max=7
        //% hour.min=0 hour.max=23
        //% minute.min=0 minute.max=59
        //% second.min=0 second.max=59
        DateTime(year: number, month: number, day: number, weekday: number, hour: number, minute: number, second: number): void {
            this.setYear(year);
            this.setMonth(month);
            this.setDay(day);
            this.setWeekday(weekday);
            this.setHour(hour);
            this.setMinute(minute);
            this.setSecond(second);
        }

        /**
         * start ds1302 RTC (go on)
         */
        //% blockId="DS1302_start" block="%ds|start RTC"
        //% weight=41 blockGap=8
        //% parts="DS1302"
        start() {
            let t = this.getSecond()
            this.setSecond(t & 0x7f)
        }

        /**
         * pause ds1302 RTC
         */
        //% blockId="DS1302_pause" block="%ds|pause RTC"
        //% weight=40 blockGap=8
        //% parts="DS1302"
        pause() {
            let t = this.getSecond()
            this.setSecond(t | 0x80)
        }

        /**
         * read RAM
         */
        //% blockId="DS1302_read_ram" block="%ds|read ram %reg"
        //% weight=43 blockGap=8
        //% parts="DS1302"
        //% reg.min=0 reg.max=30
        readRam(reg: number): number {
            return this.getReg(DS1302_REG_RAM + 1 + (reg % 31) * 2)
        }

        /**
         * write RAM
         */
        //% blockId="DS1302_write_ram" block="%ds|write ram %reg|with %dat"
        //% weight=42 blockGap=8
        //% parts="DS1302"
        //% reg.min=0 reg.max=30
        writeRam(reg: number, dat: number) {
            this.wr(DS1302_REG_RAM + (reg % 31) * 2, dat)
        }
    }

    /**
     * create a DS1302 object.
     * @param clk the CLK pin for DS1302, eg: DigitalPin.P13
     * @param dio the DIO pin for DS1302, eg: DigitalPin.P14
     * @param cs the CS pin for DS1302, eg: DigitalPin.P15
     */
    //% weight=200 blockGap=8
    //% blockId="DS1302_create" block="CLK %clk|DIO %dio|CS %cs"
    export function create(clk: DigitalPin, dio: DigitalPin, cs: DigitalPin): DS1302RTC {
        let ds = new DS1302RTC();
        ds.clk = clk;
        ds.dio = dio;
        ds.cs = cs;
        pins.digitalWritePin(ds.clk, 0);
        pins.digitalWritePin(ds.cs, 0);
        return ds;
    }

    //*************************************************************************************************//
    //DS1302 RTC related code finished                                                                 //
    //*************************************************************************************************//



    //*************************************************************************************************//
    //MPU6050 related code, adapted from https://github.com/joy-it/sen-mpu6050
    //*************************************************************************************************//
    /**
     * Enumeration of Axis (X, Y & Z)
     */
    enum axisXYZ {
        //% block="X"
        x,
        //% block="Y"
        y,
        //% block="Z"
        z
    }

    /**
     * Sensitivity of Accelerometer
     */
    enum accelSen {
        //% block="2g"
        range_2_g,
        //% block="4g"
        range_4_g,
        //% block="8g"
        range_8_g,
        //% block="16g"
        range_16_g
    }

    /**
     * Sensitivity of Gyroscope
     */
    enum gyroSen {
        //% block="250dps"
        range_250_dps,
        //% block="500dps"
        range_500_dps,
        //% block="1000dps"
        range_1000_dps,
        //% block="2000dps"
        range_2000_dps
    }

    let i2cAddress = 0x68;
    let power_mgmt = 0x6b;
    // Accelleration addresses
    let xAccelAddr = 0x3b;
    let yAccelAddr = 0x3d;
    let zAccelAddr = 0x3f;
    // Gyroscope addresses
    let xGyroAddr = 0x43;
    let yGyroAddr = 0x45;
    let zGyroAddr = 0x47;
    // Temperature address
    let tempAddr = 0x41;

    // Initialize acceleration and gyroscope values
    let xAccel = 0;
    let yAccel = 0;
    let zAccel = 0;
    let xGyro = 0;
    let yGyro = 0;
    let zGyro = 0;
    function MPUI2cRead(reg: number): number {
        pins.i2cWriteNumber(i2cAddress, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(i2cAddress, NumberFormat.UInt8BE);;
    }

    function MPUReadData(reg: number) {
        let h = MPUI2cRead(reg);
        let l = MPUI2cRead(reg+1);
        let value = (h << 8) + l;

        if (value >= 0x8000) {
            return -((65535 - value) + 1);
        }
        else {
            return value;
        }
    }

    function dist(a: number, b: number): number {
        return Math.sqrt((a*a)+(b*b));
    }

    // Update acceleration data via I2C
    function updateAcceleration(sensitivity: number) {
        // Set sensitivity of acceleration range, according to selection and datasheet value
        let accelRange = 0;
        if(sensitivity == accelSen.range_2_g) {
            // +- 2g
            accelRange = 16384;
        }
        else if(sensitivity == accelSen.range_4_g) {
            // +- 4g
            accelRange = 8192;
        }
        else if(sensitivity == accelSen.range_8_g) {
            // +- 8g
            accelRange = 4096;
        }
        else if(sensitivity == accelSen.range_16_g) {
            // +- 16g
            accelRange = 2048;
        }
        xAccel = MPUReadData(xAccelAddr) / accelRange;
        yAccel = MPUReadData(yAccelAddr) / accelRange;
        zAccel = MPUReadData(zAccelAddr) / accelRange;
    }

    // Update gyroscope data via I2C
    function updateGyroscope(sensitivity: gyroSen) {
        // Set sensitivity of gyroscope range, according to selection and datasheet value
        let gyroRange = 0;
        if(sensitivity == gyroSen.range_250_dps) {
            // +- 250dps
            gyroRange = 131;
        }
        else if(sensitivity == gyroSen.range_500_dps) {
            // +- 500dps
            gyroRange = 65.5;
        }
        else if(sensitivity == gyroSen.range_1000_dps) {
            // +- 1000dps
            gyroRange = 32.8;
        }
        else if(sensitivity == gyroSen.range_2000_dps) {
            // +- 2000dps
            gyroRange = 16.4;
        }
        xGyro = MPUReadData(xGyroAddr) / gyroRange;
        yGyro = MPUReadData(yGyroAddr) / gyroRange;
        zGyro = MPUReadData(zGyroAddr) / gyroRange;
    }

    /**
     * Initialize SEN-MPU6050
     */
    //% block="Initialize SEN-MPU6050"
    //% weight=100
    export function initMPU6050() {
        let buffer = pins.createBuffer(2);
        buffer[0] = power_mgmt;
        buffer[1] = 0;
        pins.i2cWriteBuffer(i2cAddress, buffer);
    }

    /**
      * Get gyroscope values in rad/s of the corresponding Axis, with selected sensitivity
      * @param axis select X, Y or Z axis
      * @param sensitivity select sensitivity of gyroscope (250, 500, 1000 or 2000 dps)
      */
    //% block="Gyroscope value of %axisXYZ axis with %gyroSen sensitivity (Unit: rad/s)"
    //%weight=95
    export function gyroscope(axis: axisXYZ, sensitivity: gyroSen) {
        updateGyroscope(sensitivity);
        if(axis == axisXYZ.x) {
            return xGyro;
        }
        else if(axis == axisXYZ.y) {
            return yGyro;
        }
        else {
            return zGyro;
        }
    }

    /**
     * Get rotation of the corresponding Axis
     * @param axis select X, Y or Z axis
     * @param sensitivity select sensitivity of accelerometer (2, 4, 8 or 16 g)
     */
    //% block="Angle of %xaxisXYZ axis with %accelSen sensitivity (Unit: Degrees)"
    //% weight=90
    export function axisRotation(axis: axisXYZ, sensitivity: accelSen): number {
        updateAcceleration(sensitivity);

        let radians;
        if(axis == axisXYZ.x) {
            radians = Math.atan2(yAccel, dist(xAccel,zAccel));
        }
        else if(axis == axisXYZ.y) {
            radians = -Math.atan2(xAccel, dist(yAccel,zAccel));
        }
        else if(axis == axisXYZ.z) {
            radians = Math.atan2(zAccel, dist(xAccel, yAccel));
        }

        // Convert radian to degrees and return
        let pi = Math.PI;
        let degrees = radians * (180/pi);
        return degrees;
    }

    /**
     * Get acceleration of the corresponding Axis
     * @param axis select X, Y or Z axis
     * @param sensitivity select sensitivity of accelerometer (2, 4, 8 or 16 g)
     */
    //% block="Acceleration of %xaxisXYZ axis with %accelSen sensitivity (Unit: g)"
    //% weight=85
    export function axisAcceleration(axis: axisXYZ, sensitivity: accelSen): number {
        updateAcceleration(sensitivity);
        // Return acceleration of specific axis
        if(axis == axisXYZ.x) {
            return xAccel;
        }
        else if(axis == axisXYZ.y) {
            return yAccel;
        }
        else {
            return zAccel;
        }
    }

    /**
     * Get temperature in degree Celsius from MPU6050
     */
    //% block="Temperature (Unit: Celsius)"
    //% weight=80
    export function readTemperature(): number {
        let rawTemp = MPUReadData(tempAddr);
        return 36.53 + rawTemp / 340;
    }

    //*************************************************************************************************//
    //MPU6050 related code finished                                                                    //
    //*************************************************************************************************//

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
     * Get ultrasonic distance in mm
     */
    //% block="dist (Unit: mm)" subcategory="Maze Car"
    //% group="Ultrasound"
    //% weight=70
    export function ultrasoundResult(): number {
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
    */
    //% block="yaw (Unit: deg)" subcategory="Soccer Robot"
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
        //% block="red"
        R,
        //% block="green"
        G,
        //% block="blue"
        B
    }

    /**
     * RGBC color sensor values
     */
    export enum PKSDriverRGBC {
        //% block="clear"
        C,
        //% block="red"
        R,
        //% block="green"
        G,
        //% block="blue"
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
        //% block="black"
        Black = 0,
        //% block="white"
        White,
        //% block="gray"
        Gray,
        //% block="red"
        Red,
        //% block="green"
        Green,
        //% block="blue"
        Blue,
        //% block="yellow"
        Yellow,
        //% block="cyan"
        Cyan,
        //% block="purple"
        Purple
    }

    /**
    * HSL read function
    * @param hslchoose H, S, or L
    */
    //% blockId=pksdriver_readhsl block="read HSL $hslchoose" subcategory="Edu Kit"
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
    */
    //% blockId=pksdriver_readrgb block="read RGB $rgbchoose" subcategory="Edu Kit"
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
    */
    //% blockId=pksdriver_readrgbc block="read RGBC $choose" subcategory="Edu Kit"
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
    * return the detected color (Black, White, Gray, Red, Green, Blue, Yellow, Cyan, Purple)
    */
    //% blockId=pksdriver_readcolor block="read Color" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function readColor(): PKSDriverColor_t {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.COLOR, NumberFormat.UInt8BE, false);
        return pins.i2cReadBuffer(PKSDriverColor.ADDR, 1, false).getNumber(NumberFormat.UInt8LE, 0);
    }

    /**
    * check read color
    * @param color The color to check against
    */
    //% blockId=pksdriver_checkReadColor block="read color is %color_t" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function checkReadColor(color: PKSDriverColor_t): boolean {
        return readColor() == color
    }

    /**
    * check if colors matches
    *  @param color The color to check against
    */
    //% blockId=pksdriver_checkGetColor block="get color is %color_t" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function checkGetColor(color: PKSDriverColor_t): boolean {
        return getColor() == color
    }

    /**
    * function transfer hsl value to color 
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
        //% block="channel 1"
        C1,
        //% block="channel 2"
        C2,
        //% block="channel 3"
        C3,
        //% block="channel 4"
        C4,
        //% block="channel 5"
        C5,
        //% block="channel 6"
        C6,
        //% block="channel 7"
        C7,
        //% block="channel 8"
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
    //% blockId=pksdriver_switch_channel_edu block="switch i2c %channelselected" subcategory="Edu Kit"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelEdu(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

    /**
     * Switch I2C multiplexer channel (Maze Car)
     * @param channelselected C1~C8
     */
    //% blockId=pksdriver_switch_channel_maze block="switch i2c %channelselected" subcategory="Maze Car"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelMaze(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

    /**
     * Switch I2C multiplexer channel (Soccer Robot)
     * @param channelselected C1~C8
     */
    //% blockId=pksdriver_switch_channel_soccer block="switch i2c %channelselected" subcategory="Soccer Robot"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelSoccer(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

    /**
     * Switch I2C multiplexer channel (Smart Living)
     * @param channelselected C1~C8
     */
    //% blockId=pksdriver_switch_channel_smart block="switch i2c %channelselected" subcategory="Smart Living"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelSmart(channelselected: PKSDriverI2cchannel): void {
        switchI2CMultiplexer(channelselected);
    }

}