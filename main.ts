
//% weight=60
//% color=#1c4980 
//% icon="\uf2db" 
//% block="PKS Driver"
namespace pksdriver {

    const PCA9685_ADDRESS = 0x40
    const MODE = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const SERVO_FREQ = 50
    const STEPPER_FREQ = 1522
    
    /**
     * For maze car's use only
     * Maze car direction options
     */
    export enum MazeCarDirection {
        //% block="front"
        FRONT,
        //% block="back"
        BACK,
        //% block="left"
        LEFT,
        //% block="right"
        RIGHT
    }

    /**
     * The user can select the 8 steering gear controller.
     */
    export enum PKSDriverServos {
        //% block="S1"
        S1 = 0x08,
        //% block="S2"
        S2 = 0x07,
        //% block="S3"
        S3 = 0x06,
        //% block="S4"
        S4 = 0x05,
        //% block="S5"
        S5 = 0x04,
        //% block="S6"
        S6 = 0x03
    }

    /**
     * The user selects the 4-way dc motor.
     */
    export enum PKSDriverMotors {
        //% block="M0"
        M0 = 0x0,
        //% block="M1"
        M1 = 0x1,
        //% block="M2"
        M2 = 0x2,
        //% block="M3"
        M3 = 0x3,
        //% block="M4"
        M4 = 0x4
    }

    export enum PKSMotorPorts {
        //% block="M0+"
        M0P = 6,
        //% block="M0-"
        M0N = 7,
        //% block="M1+"
        M1P = 8,
        //% block="M1-"
        M1N = 9,
        //% block="M2+"
        M2P = 10,
        //% block="M2-"
        M2N = 11,
        //% block="M3+"
        M3P = 12,
        //% block="M3-"
        M3N = 13,
        //% block="M4+"
        M4P = 14,
        //% block="M4-"
        M4N = 15,
    }

    /**
     * the motor rotation direction
     */
    export enum PKSDriverDirection {
        //% blockId="pksdriver_CW" block="clockwise"
        Clockwise = 1,
        //% blockId="pksdriver_CCW" block="counterclockwise"
        Counterclockwise = -1
    }

    let initialized = false
    let currentFreq = 0

    /**
     * initalize PCA9685
     */
    function initPCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE, 0x00)
        setFreq(SERVO_FREQ)
        initialized = true
    }

    function ensurePCA9685Initialized(): void {
        if (!initialized) {
            i2cWrite(PCA9685_ADDRESS, MODE, 0x00)
            initialized = true
        }
    }

    function ensurePCA9685Freq(freq: number): void {
        let needsInit = !initialized
        ensurePCA9685Initialized()
        if (needsInit || currentFreq != freq) {
            setFreq(freq)
        }
    }

    /**
     * Read data from I2C device
     * @param addr I2C device address  
     * @param reg Register address
     */
    export function i2cRead(addr: number, reg: number) {
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
    export function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    /**
     * Set PWM frequency for PCA9685
     * @param freq Frequency in Hz (default 50)
     */
    export function setFreq(freq: number): void {
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
        currentFreq = freq
    }

    /**
     * Set PWM value for a channel on PCA9685
     * @param channel PWM channel (0-15)
     * @param on On time
     * @param off Off time
     */
    export function setPwm(channel: number, on: number, off: number): void {
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
     * @param index S1~S6.
     * @param degree 0°~180°.
    */
    //% blockId=pksdriver_motor_servo block="servo|%index|degree|%degree" subcategory="Edu Kit"
    //% group="Servo"
    //% weight=100
    //% degree.min=0 degree.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function servo(index: PKSDriverServos, degree: number): void {
        ensurePCA9685Freq(SERVO_FREQ)
        // 50hz
        let v_us = (degree * 1800 / 180 + 600) // 0.6ms ~ 2.4ms
        let value = v_us * 4096 / 20000
        setPwm(8 - index, 0, value)
    }


    /**
     * Steering gear control function 
     * @param index S1~S6.
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
     * @param index S1~S6.
    */
    //% blockId=pksdriver_motor_servoOff block="servo off|%index" subcategory="Edu Kit"
    //% group="Servos"
    //% weight=99
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function servoOff(index: PKSDriverServos): void {
        ensurePCA9685Freq(SERVO_FREQ)
        setPwm(8 - (index), 0, 0)
    }

    /**
     * set servo on
     * @param index S1~S6.
    */
    //% blockId=pksdriver_motor_servoOn block="servo on|%index" subcategory="Edu Kit"
    //% group="Servos"
    //% weight=98
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=4
    export function servoOn(index: PKSDriverServos): void {
        ensurePCA9685Freq(SERVO_FREQ)
        setPwm(8 - (index), 0, 150)
    }

    /**
     * Execute a motor
     * @param index M0~M4.
     * @param direction clockwise/counterclockwise
     * @param speed speed(0~255).
    */
    //% weight=130
    //% blockId=pksdriver_motor_MotorRun block="motor|%index|direction|%direction|speed|%speed" subcategory="Edu Kit"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% group="Motors"
    export function motorRun(index: PKSDriverMotors, direction: PKSDriverDirection, speed: number): void {
        ensurePCA9685Freq(SERVO_FREQ)
        speed = speed * 16 * direction; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index < 0)
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
     * @param index M0~M4.
     * @param direction clockwise/counterclockwise
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
     * @param index M0~M4
    */
    //% weight=129
    //% blockId=pksdriver_motor_motorStop block="motor stop|%index" subcategory="Edu Kit"
    //% group="Motors"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function motorStop(index: PKSDriverMotors) {
        ensurePCA9685Freq(SERVO_FREQ)
        if (index > 4 || index < 0)
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
    //% blockId=pksdriver_motor_motorStopAll block="stop all motors" subcategory="Edu Kit"
    //% group="Motors"
    export function motorStopAll(): void {
        for (let idx = 0; idx <= 4; idx++) {
            motorStop(idx);
        }
    }

    /**
    * Stop all motors
    */
    //% weight=128
    //% blockId=pksdriver_maze_motor_motorStopAll block="stop all motors" subcategory="Maze Car"
    //% group="Motors"
    export function mazeMotorStopAll(): void {
        motorStopAll();
    }

    /**
     * Switch light on 
     * @param index M0~M4.
     */
    //% weight=90
    //% blockId=pksdriver_light_lighton block="light on|%index" subcategory="Smart Living"
    //% group="Grow Lights"
    export function lightOn(index: PKSDriverMotors): void {
        motorRun(index, 1, 255);
    }

    /**
     * Switch fan on
     * @param index M0~M4. 
     */
    //% weight=90
    //% blockId=pksdriver_fan_fanon block="fan on|%index" subcategory="Smart Living"
    //% group="Fan"
    export function fanOn(index: PKSDriverMotors): void {
        motorRun(index, -1, 255);
    }

    /**
     * Switch light off
     * @param index M0~M4.
     */
    //% weight=90
    //% blockId=pksdriver_light_lightoff block="light off|%index" subcategory="Smart Living"
    //% group="Grow Lights"
    export function lightOff(index: PKSDriverMotors) {
        motorStop(index);
    }


    /**
     * Switch fan off
     * @param index M0~M4.
     */
    //% weight=90
    //% blockId=pksdriver_fan_fanoff block="fan off|%index" subcategory="Smart Living"
    //% group="Fan"
    export function fanOff(index: PKSDriverMotors) {
        motorStop(index);
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
    //% blockId=pksdriver_compoundEye block="compound %compoundEyeData"  subcategory="Soccer Robot"
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

    //*************************************************************************************************//
    //AHT20 related code, adapted from https://github.com/koudayao27/AHT20                             //
    //*************************************************************************************************//

    type AHT20Reading = { Humidity: number, Temperature: number }

    export class AHT20Sensor {
        public constructor(address: number = 0x38) {
            this._Address = address;
        }

        public Initialization(): AHT20Sensor {
            const buf = pins.createBuffer(3);
            buf[0] = 0xbe;
            buf[1] = 0x08;
            buf[2] = 0x00;
            pins.i2cWriteBuffer(this._Address, buf, false);
            basic.pause(10);

            return this;
        }

        public TriggerMeasurement(): AHT20Sensor {
            const buf = pins.createBuffer(3);
            buf[0] = 0xac;
            buf[1] = 0x33;
            buf[2] = 0x00;
            pins.i2cWriteBuffer(this._Address, buf, false);
            basic.pause(80);

            return this;
        }

        public State(): { Busy: boolean, Calibrated: boolean } {
            const buf = pins.i2cReadBuffer(this._Address, 1, false);
            const busy = buf[0] & 0x80 ? true : false;
            const calibrated = buf[0] & 0x08 ? true : false;

            return { Busy: busy, Calibrated: calibrated };
        }

        public Read(): AHT20Reading | null {
            const buf = pins.i2cReadBuffer(this._Address, 7, false);

            const crc8 = AHT20Sensor.CalcCRC8(buf, 0, 6);
            if (buf[6] != crc8) return null;

            const humidity = ((buf[1] << 12) + (buf[2] << 4) + (buf[3] >> 4)) * 100 / 1048576;
            const temperature = (((buf[3] & 0x0f) << 16) + (buf[4] << 8) + buf[5]) * 200 / 1048576 - 50;

            return { Humidity: humidity, Temperature: temperature };
        }

        private _Address: number;

        private static CalcCRC8(buf: Buffer, offset: number, size: number): number {
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
     * AHT20 Custom Block
     */
    const crc_table = [
        0x00, 0x31, 0x62, 0x53, 0xC4, 0xF5, 0xA6, 0x97, 0xB9, 0x88, 0xDB, 0xEA, 0x7D, 0x4C, 0x1F, 0x2E,
        0x43, 0x72, 0x21, 0x10, 0x87, 0xB6, 0xE5, 0xD4, 0xFA, 0xCB, 0x98, 0xA9, 0x3E, 0x0F, 0x5C, 0x6D,
        0x86, 0xB7, 0xE4, 0xD5, 0x42, 0x73, 0x20, 0x11, 0x3F, 0x0E, 0x5D, 0x6C, 0xFB, 0xCA, 0x99, 0xA8,
        0xC5, 0xF4, 0xA7, 0x96, 0x01, 0x30, 0x63, 0x52, 0x7C, 0x4D, 0x1E, 0x2F, 0xB8, 0x89, 0xDA, 0xEB,
        0x3D, 0x0C, 0x5F, 0x6E, 0xF9, 0xC8, 0x9B, 0xAA, 0x84, 0xB5, 0xE6, 0xD7, 0x40, 0x71, 0x22, 0x13,
        0x7E, 0x4F, 0x1C, 0x2D, 0xBA, 0x8B, 0xD8, 0xE9, 0xC7, 0xF6, 0xA5, 0x94, 0x03, 0x32, 0x61, 0x50,
        0xBB, 0x8A, 0xD9, 0xE8, 0x7F, 0x4E, 0x1D, 0x2C, 0x02, 0x33, 0x60, 0x51, 0xC6, 0xF7, 0xA4, 0x95,
        0xF8, 0xC9, 0x9A, 0xAB, 0x3C, 0x0D, 0x5E, 0x6F, 0x41, 0x70, 0x23, 0x12, 0x85, 0xB4, 0xE7, 0xD6,
        0x7A, 0x4B, 0x18, 0x29, 0xBE, 0x8F, 0xDC, 0xED, 0xC3, 0xF2, 0xA1, 0x90, 0x07, 0x36, 0x65, 0x54,
        0x39, 0x08, 0x5B, 0x6A, 0xFD, 0xCC, 0x9F, 0xAE, 0x80, 0xB1, 0xE2, 0xD3, 0x44, 0x75, 0x26, 0x17,
        0xFC, 0xCD, 0x9E, 0xAF, 0x38, 0x09, 0x5A, 0x6B, 0x45, 0x74, 0x27, 0x16, 0x81, 0xB0, 0xE3, 0xD2,
        0xBF, 0x8E, 0xDD, 0xEC, 0x7B, 0x4A, 0x19, 0x28, 0x06, 0x37, 0x64, 0x55, 0xC2, 0xF3, 0xA0, 0x91,
        0x47, 0x76, 0x25, 0x14, 0x83, 0xB2, 0xE1, 0xD0, 0xFE, 0xCF, 0x9C, 0xAD, 0x3A, 0x0B, 0x58, 0x69,
        0x04, 0x35, 0x66, 0x57, 0xC0, 0xF1, 0xA2, 0x93, 0xBD, 0x8C, 0xDF, 0xEE, 0x79, 0x48, 0x1B, 0x2A,
        0xC1, 0xF0, 0xA3, 0x92, 0x05, 0x34, 0x67, 0x56, 0x78, 0x49, 0x1A, 0x2B, 0xBC, 0x8D, 0xDE, 0xEF,
        0x82, 0xB3, 0xE0, 0xD1, 0x46, 0x77, 0x24, 0x15, 0x3B, 0x0A, 0x59, 0x68, 0xFF, 0xCE, 0x9D, 0xAC
    ];
    
    /**
     * Reads humidity and temperature from the AHT20 sensor.
     * @param sensor The AHT20 sensor instance
     */
    function readAht20(aht20: AHT20Sensor): AHT20Reading | null {
        if (!aht20.State().Calibrated) {
            aht20.Initialization();
            if (!aht20.State().Calibrated) return null;
        }

        aht20.TriggerMeasurement();
        for (let i = 0; ; ++i) {
            if (!aht20.State().Busy) break;
            if (i >= 500) return null;
            basic.pause(10);
        }

        return aht20.Read();
    }

    /**
     * Read temperature in Celsius from AHT20 sensor
     */
    //% group="Temperature and Humidity (AHT20)"  subcategory="Smart Living"
    //% block="read temperature (°C)"
    //% weight=3
    export function aht20ReadTemperatureC(): number {
        const sensor = new AHT20Sensor();
        const val = readAht20(sensor);
        if (!val) return NaN;

        return val.Temperature;
    }

    /**
     * Read temperature in Fahrenheit from AHT20 sensor
     */
    //% group="Temperature and Humidity (AHT20)" subcategory="Smart Living"
    //% block="read temperature (°F)"
    //% weight=2
    export function aht20ReadTemperatureF(): number {
        const sensor = new AHT20Sensor();
        const val = readAht20(sensor);
        if (!val) return NaN;

        return val.Temperature * 9 / 5 + 32;
    }

    /**
     * Read humidity from AHT20 sensor
     */
    //% block="read humidity" subcategory="Smart Living"
    //% group="Temperature and Humidity (AHT20)" 
    //% weight=1
    export function aht20ReadHumidity(): number {
        const aht20 = new AHT20Sensor();
        const val = readAht20(aht20);
        if (val == null) return NaN;

        return val.Humidity;
    }

    /**
     * Read the absolute humidity
     */
    //% block="read the absolute humidity (g/m³) || as fixed-point 8.8bit %fp88" subcategory="Smart Living"
    //% group="Temperature and Humidity (AHT20)"
    //% weight=0
    export function readAbsHumidity(fp88?: boolean): uint16 {
        const aht20 = new AHT20Sensor();
        const val = readAht20(aht20);
        if (val == null) return 0;
        const T = val.Temperature;
        const rh = val.Humidity;
        const ret = 6.112 * Math.exp((17.67 * T) / (T + 243.5)) * rh * 2.1674 / (273.15 + T);
        if (!fp88) {
            return ret;
        }
        const byte0 = Math.floor(ret);
        const byte1 = Math.floor(256 * (ret - byte0));
        return byte0 << 8 | byte1 & 0xffff;
    }

    /**
     * Calculate CRC8
     */
    //% block="calculate CRC8 of %n" subcategory="Smart Living"
    //% group="Temperature and Humidity (AHT20)"
    //% weight=0 
    export function crc8(n: number): uint8 {
        const byte1 = n & 0xff;
        const byte0 = (n >> 8) & 0xff;
        let crc = 0xff ^ byte0;
        crc = crc_table[crc];
        crc = crc ^ byte1;
        crc = crc_table[crc];
        return crc;
    }

    //************************************************************************************************//
    //AHT20 related code end                                                                          //
    //************************************************************************************************//



    //*************************************************************************************************//
    //DHT11/DHT22 related code, adapted from https://github.com/alankrantas/pxt-dht11_dht22            //
    //*************************************************************************************************//
    export enum DHTType {
        //% block="DHT11"
        DHT11,
        //% block="DHT22"
        DHT22,
    }

    export enum DataType {
        //% block="humidity"
        Humidity,
        //% block="temperature"
        Temperature,
    }

    export enum TempType {
        //% block="Celsius (°C)"
        Celsius,
        //% block="Fahrenheit (°F)"
        Fahrenheit,
    }

    let _temperature: number = -999.0
    let _humidity: number = -999.0
    let _temptype: TempType = TempType.Celsius
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
    //% block="query %DHT|data pin %dataPin|pin pull up %pullUp|serial output %serialOutput|wait 2 sec after query %wait"
    //% pullUp.defl=true
    //% serialOutput.defl=false
    //% wait.defl=true
    //% blockExternalInputs=true
    //% weight=100
    //% subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function queryData(DHT: DHTType, dataPin: DigitalPin, pullUp: boolean, serialOutput: boolean, wait: boolean) {
        //initialize
        let startTime: number = 0
        let endTime: number = 0
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        let DHTstr: string = (DHT == DHTType.DHT11) ? "DHT11" : "DHT22"

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
                if (DHT == DHTType.DHT11) {
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
                if (_temptype == TempType.Fahrenheit)
                    _temperature = _temperature * 9 / 5 + 32
            }

            //serial output
            if (serialOutput) {
                serial.writeLine(DHTstr + " query completed in " + (endTime - startTime) + " microseconds")
                if (_readSuccessful) {
                    serial.writeLine("Checksum ok")
                    serial.writeLine("Humidity: " + _humidity + " %")
                    serial.writeLine("Temperature: " + _temperature + (_temptype == TempType.Celsius ? " °C" : " °F"))
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
    //% block="read %data" subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    export function DHTReadData(data: DataType): number {
        return data == DataType.Humidity ? _humidity : _temperature
    }

    /**
    * Select temperature type (Celsius/Fahrenheit)
    * @param temp 
    */
    //% block="temperature type: %temp" subcategory="Smart Living"
    //% group="Temperature and Humidity (DHT11/DHT22)" 
    //% weight=98
    export function selectTempType(temp: TempType) {
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
        return Math.floor(dat / 10) * 16 + (dat % 10)
    }

    /**
     * DS1302 RTC class
     */
    export class DS1302RTC {
        clk: DigitalPin;
        dio: DigitalPin;
        cs: DigitalPin;

        constructor() {
            this.clk = DigitalPin.P0
            this.dio = DigitalPin.P0
            this.cs = DigitalPin.P0
        }

        /**
         * write a byte to DS1302
         */
        /**
         * name
         */
        writeByte(dat: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.dio, (dat >> i) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
        }

        /**
         * read a byte from DS1302
         */
        readByte(): number {
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
        readReg(reg: number): number {
            let t = 0;
            pins.digitalWritePin(this.cs, 1);
            this.writeByte(reg);
            t = this.readByte();
            pins.digitalWritePin(this.cs, 0);
            return t;
        }

        /**
         * write reg
         */
        setReg(reg: number, dat: number) {
            pins.digitalWritePin(this.cs, 1);
            this.writeByte(reg);
            this.writeByte(dat);
            pins.digitalWritePin(this.cs, 0);
        }

        /**
         * write reg with WP protect
         */
        writeReg(reg: number, dat: number) {
            this.setReg(DS1302_REG_WP, 0)
            this.setReg(reg, dat)
            this.setReg(DS1302_REG_WP, 0)
        }

        /**
         * get Year
         */
        //% blockId="pksdriver_DS1302_get_year" block="%ds|get year" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=70 blockGap=8
        //% parts="DS1302"
        year(): number {
            return Math.min(HexToDec(this.readReg(DS1302_REG_YEAR + 1)), 99) + 2000
        }

        /**
         * set year
         * @param dat is the Year will be set, eg: 2018
         */
        //% blockId="pksdriver_DS1302_set_year" block="%ds|set year %dat" subcategory="Smart Living"
        //% weight=80 blockGap=8
        //% group="Real time clock"
        //% parts="DS1302"
        setYear(dat: number): void {
            this.writeReg(DS1302_REG_YEAR, DecToHex(dat % 100))
        }

        /**
         * get Month
         */
        //% blockId="pksdriver_DS1302_get_month" block="%ds|get month" subcategory="Smart Living"
        //% weight=69 blockGap=8
        //% parts="DS1302"
        //% group="Real time clock"
        month(): number {
            return Math.max(Math.min(HexToDec(this.readReg(DS1302_REG_MONTH + 1)), 12), 1)
        }

        /**
         * set month
         * @param dat is Month will be set.  eg: 2
         */
        //% blockId="pksdriver_DS1302_set_month" block="%ds|set month %dat" subcategory="Smart Living"
        //% weight=79 blockGap=8
        //% group="Real time clock"
        //% parts="DS1302"
        //% dat.min=1 dat.max=12
        setMonth(dat: number): void {
            this.writeReg(DS1302_REG_MONTH, DecToHex(dat % 13))
        }

        /**
         * get Day
         */
        //% blockId="pksdriver_DS1302_get_day" block="%ds|get day" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=68 blockGap=8
        //% parts="DS1302"
        day(): number {
            return Math.max(Math.min(HexToDec(this.readReg(DS1302_REG_DAY + 1)), 31), 1)
        }

        /**
         * set day
         * @param dat is the Day will be set, eg: 15
         */
        //% blockId="pksdriver_DS1302_set_day" block="%ds|set day %dat" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=78 blockGap=8
        //% parts="DS1302"
        //% dat.min=1 dat.max=31
        setDay(dat: number): void {
            this.writeReg(DS1302_REG_DAY, DecToHex(dat % 32))
        }

        /**
         * get Week Day
         */
        //% blockId="pksdriver_DS1302_get_weekday" block="%ds|get weekday" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=67 blockGap=8
        //% parts="DS1302"
        weekday(): number {
            return Math.max(Math.min(HexToDec(this.readReg(DS1302_REG_WEEKDAY + 1)), 7), 1)
        }

        /**
         * set weekday
         * @param dat is the Week Day will be set, eg: 4
         */
        //% blockId="pksdriver_DS1302_set_weekday" block="%ds|set weekday %dat" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=77 blockGap=8
        //% parts="DS1302"
        //% dat.min=1 dat.max=7
        setWeekday(dat: number): void {
            this.writeReg(DS1302_REG_WEEKDAY, DecToHex(dat % 8))
        }

        /**
         * get Hour
         */
        //% blockId="pksdriver_DS1302_get_hour" block="%ds|get hour" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=66 blockGap=8
        //% parts="DS1302"
        hour(): number {
            return Math.min(HexToDec(this.readReg(DS1302_REG_HOUR + 1)), 23)
        }

        /**
         * set hour
         * @param dat is the Hour will be set, eg: 0
         */
        //% blockId="pksdriver_DS1302_set_hour" block="%ds|set hour %dat" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=76 blockGap=8
        //% parts="DS1302"
        //% dat.min=0 dat.max=23
        setHour(dat: number): void {
            this.writeReg(DS1302_REG_HOUR, DecToHex(dat % 24))
        }

        /**
         * get Minute
         */
        //% blockId="pksdriver_DS1302_get_minute" block="%ds|get minute" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=65 blockGap=8
        //% parts="DS1302"
        minute(): number {
            return Math.min(HexToDec(this.readReg(DS1302_REG_MINUTE + 1)), 59)
        }

        /**
         * set minute
         * @param dat is the Minute will be set, eg: 0
         */
        //% blockId="pksdriver_DS1302_set_minute" block="%ds|set minute %dat" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=75 blockGap=8
        //% parts="DS1302"
        //% dat.min=0 dat.max=59
        setMinute(dat: number): void {
            this.writeReg(DS1302_REG_MINUTE, DecToHex(dat % 60))
        }

        /**
         * get Second
         */
        //% blockId="pksdriver_DS1302_get_second" block="%ds|get second" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=64 blockGap=8
        //% parts="DS1302"
        second(): number {
            return Math.min(HexToDec(this.readReg(DS1302_REG_SECOND + 1)), 59)
        }

        /**
         * set second
         * @param dat is the Second will be set, eg: 0
         */
        //% blockId="pksdriver_DS1302_set_second" block="%ds|set second %dat" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=74 blockGap=8
        //% parts="DS1302"
        //% dat.min=0 dat.max=59
        setSecond(dat: number): void {
            this.writeReg(DS1302_REG_SECOND, DecToHex(dat % 60))
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
        //% blockId="pksdriver_DS1302_set_dateTime" block="%ds|set date and time:| year %year|month %month|day %day|weekday %weekday|hour %hour|minute %minute|second %second" subcategory="Smart Living"
        //% weight=180 blockGap=8
        //% parts="DS1302"
        //% year.min=2000 year.max=2100
        //% month.min=1 month.max=12
        //% day.min=1 day.max=31
        //% weekday.min=1 weekday.max=7
        //% hour.min=0 hour.max=23
        //% minute.min=0 minute.max=59
        //% second.min=0 second.max=59
        //% group="Real time clock"
        dateTime(year: number, month: number, day: number, weekday: number, hour: number, minute: number, second: number): void {
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
        //% blockId="pksdriver_DS1302_start" block="%ds|start RTC" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=41 blockGap=8
        //% parts="DS1302"
        start(): void {
            let t = this.second()
            this.setSecond(t & 0x7f)
        }

        /**
         * pause ds1302 RTC
         */
        //% blockId="pksdriver_DS1302_pause" block="%ds|pause RTC" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=40 blockGap=8
        //% parts="DS1302"
        pause(): void {
            let t = this.second()
            this.setSecond(t | 0x80)
        }

        /**
         * read RAM
         */
        //% blockId="pksdriver_DS1302_read_ram" block="%ds|read RAM %reg" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=43 blockGap=8
        //% parts="DS1302"
        //% reg.min=0 reg.max=30
        public readRam(reg: number): number {
            return this.readReg(DS1302_REG_RAM + 1 + (reg % 31) * 2)
        }

        /**
         * write RAM
         */
        //% blockId="pksdriver_DS1302_write_ram" block="%ds|write RAM %reg|with %dat" subcategory="Smart Living"
        //% group="Real time clock"
        //% weight=42 blockGap=8
        //% parts="DS1302"
        //% reg.min=0 reg.max=30
        public writeRam(reg: number, dat: number): void {
            this.writeReg(DS1302_REG_RAM + (reg % 31) * 2, dat)
        }
    }

    /**
     * create a DS1302 object.
     * The CLK, DIO and CS pins can be assigned to any digital pin.
     * @param clk the CLK pin for DS1302, eg: DigitalPin.P13
     * @param dio the DIO pin for DS1302, eg: DigitalPin.P14
     * @param cs the CS pin for DS1302, eg: DigitalPin.P15
     */
    //% weight=200 blockGap=8 
    //% blockSetVariable=ds
    //% blockId="pksdriver_DS1302_create" block="DS1302 wiring configuration: CLK %clk|DIO %dio|CS %cs" subcategory="Smart Living"
    //% group="Real time clock"
    export function createDS1302(clk: DigitalPin, dio: DigitalPin, cs: DigitalPin): DS1302RTC {
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
    export enum AxisXYZ {
        //% block="x"
        X,
        //% block="y"
        Y,
        //% block="z"
        Z
    }

    /**
     * Sensitivity of Accelerometer
     */
    export enum AccelSen {
        //% block="2g"
        Range2g,
        //% block="4g"
        Range4g,
        //% block="8g"
        Range8g,
        //% block="16g"
        Range16g
    }

    /**
     * Sensitivity of Gyroscope
     */
    export enum GyroSen {
        //% block="250dps"
        Range250dps,
        //% block="500dps"
        Range500dps,
        //% block="1000dps"
        Range1000dps,
        //% block="2000dps"
        Range2000dps
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
        let l = MPUI2cRead(reg + 1);
        let value = (h << 8) + l;

        if (value >= 0x8000) {
            return -((65535 - value) + 1);
        }
        else {
            return value;
        }
    }

    function dist(a: number, b: number): number {
        return Math.sqrt((a * a) + (b * b));
    }

    // Update acceleration data via I2C
    function updateAcceleration(sensitivity: AccelSen) {
        // Set sensitivity of acceleration range, according to selection and datasheet value
        let accelRange = 0;
        if (sensitivity == AccelSen.Range2g) {
            // +- 2g
            accelRange = 16384;
        }
        else if (sensitivity == AccelSen.Range4g) {
            // +- 4g
            accelRange = 8192;
        }
        else if (sensitivity == AccelSen.Range8g) {
            // +- 8g
            accelRange = 4096;
        }
        else if (sensitivity == AccelSen.Range16g) {
            // +- 16g
            accelRange = 2048;
        }
        xAccel = MPUReadData(xAccelAddr) / accelRange;
        yAccel = MPUReadData(yAccelAddr) / accelRange;
        zAccel = MPUReadData(zAccelAddr) / accelRange;
    }

    // Update gyroscope data via I2C
    function updateGyroscope(sensitivity: GyroSen) {
        // Set sensitivity of gyroscope range, according to selection and datasheet value
        let gyroRange = 0;
        if (sensitivity == GyroSen.Range250dps) {
            // +- 250dps
            gyroRange = 131;
        }
        else if (sensitivity == GyroSen.Range500dps) {
            // +- 500dps
            gyroRange = 65.5;
        }
        else if (sensitivity == GyroSen.Range1000dps) {
            // +- 1000dps
            gyroRange = 32.8;
        }
        else if (sensitivity == GyroSen.Range2000dps) {
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
    //% block="initialize SEN-MPU6050"
    //% group="MPU6050 gyroscope and accelerometer sensor"
    //% weight=100
    export function initMPU6050() {
        let buffer = pins.createBuffer(2);
        buffer[0] = power_mgmt;
        buffer[1] = 0;
        pins.i2cWriteBuffer(i2cAddress, buffer);
    }

    /**
      * Get gyroscope values in radian per second of the corresponding Axis, with selected sensitivity
      * @param axis select X, Y or Z axis
      * @param sensitivity select sensitivity of gyroscope (250, 500, 1000 or 2000 dps)
      */
    //% block="gyroscope value of %axis axis with %sensitivity sensitivity (unit: rad/s)"
    //% group="MPU6050 gyroscope and accelerometer sensor"
    //% weight=95
    export function gyroscope(axis: AxisXYZ, sensitivity: GyroSen): number {
        updateGyroscope(sensitivity);
        if (axis == AxisXYZ.X) {
            return xGyro;
        }
        else if (axis == AxisXYZ.Y) {
            return yGyro;
        }
        else {
            return zGyro;
        }
    }

    /**
     * Get rotation of the corresponding Axis in degree
     * @param axis select X, Y or Z axis
     * @param sensitivity select sensitivity of accelerometer (2, 4, 8 or 16 g)
     */
    //% block="angle of %axis axis with %sensitivity sensitivity (unit: degrees)"
    //% group="MPU6050 gyroscope and accelerometer sensor"
    //% weight=90
    export function axisRotation(axis: AxisXYZ, sensitivity: AccelSen): number {
        updateAcceleration(sensitivity);

        let radians = 0;
        if (axis == AxisXYZ.X) {
            radians = Math.atan2(yAccel, dist(xAccel, zAccel));
        }
        else if (axis == AxisXYZ.Y) {
            radians = -Math.atan2(xAccel, dist(yAccel, zAccel));
        }
        else if (axis == AxisXYZ.Z) {
            radians = Math.atan2(zAccel, dist(xAccel, yAccel));
        }

        // Convert radian to degrees and return
        let pi = Math.PI;
        let degrees = radians * (180 / pi);
        return degrees;
    }

    /**
     * Get acceleration of the corresponding Axis
     * @param axis select X, Y or Z axis
     * @param sensitivity select sensitivity of accelerometer (2, 4, 8 or 16 g)
     */
    //% block="acceleration of %axis axis with %sensitivity sensitivity (unit: g)"
    //% group="MPU6050 gyroscope and accelerometer sensor"
    //% weight=85
    export function axisAcceleration(axis: AxisXYZ, sensitivity: AccelSen): number {
        updateAcceleration(sensitivity);
        // Return acceleration of specific axis
        if (axis == AxisXYZ.X) {
            return xAccel;
        }
        else if (axis == AxisXYZ.Y) {
            return yAccel;
        }
        else {
            return zAccel;
        }
    }

    /**
     * Get temperature in degree Celsius from MPU6050
     */
    //% block="temperature (unit: Celsius)"
    //% group="MPU6050 gyroscope and accelerometer sensor"
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
    //% block="distance (unit: mm)" subcategory="Maze Car"
    //% group="Ultrasound"
    //% weight=70
    export function ultrasoundDistance(): number {
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
    //% block="yaw (unit: degree)" subcategory="Soccer Robot"
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
    //% block="direction %wantedDirection" subcategory="Maze Car"
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
    export enum PKSDriverColorType {
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
    //% blockId=pksdriver_readhsl block="read HSL %hslchoose" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=80
    export function readHSL(hslchoose: PKSDriverHSL): number {
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
    //% blockId=pksdriver_readrgb block="read RGB %rgbchoose" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=60
    export function readRGB(rgbchoose: PKSDriverRGB): number {
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
    //% blockId=pksdriver_readrgbc block="read RGBC %choose" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function readRGBC(choose: PKSDriverRGBC): number {
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
    * the preset threshold on the color sensor may not be accurate, it is recommended to use readHSL or readRGB function to get the raw data and do the color analysis by yourself for better accuracy
    */
    //% blockId=pksdriver_readcolor block="read color" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function readColor(): PKSDriverColorType {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.COLOR, NumberFormat.UInt8BE, false);
        return pins.i2cReadBuffer(PKSDriverColor.ADDR, 1, false).getNumber(NumberFormat.UInt8LE, 0);
    }

    /**
    * check read color
    * @param color The color to check against
    */
    //% blockId=pksdriver_checkReadColor block="is read color %color" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function checkReadColor(color: PKSDriverColorType): boolean {
        return readColor() == color
    }

    /**
    * check if colors matches
    *  @param color The color to check against
    */
    //% blockId=pksdriver_checkGetColor block="is color %color" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function checkGetColor(color: PKSDriverColorType): boolean {
        return reAnalysisColor() == color
    }

    /**
    * function transfer hsl value to color 
    * redefine the color threshold 
    */
    //% blockId=pksdriver_getcolor block="get color" subcategory="Edu Kit"
    //% group="Colors"
    //% weight=70
    export function reAnalysisColor(): number {
        pins.i2cWriteNumber(PKSDriverColor.ADDR, PKSDriverColor.HSL, NumberFormat.UInt8BE, false);
        let hsl = pins.i2cReadBuffer(PKSDriverColor.ADDR, 4, false);
        let temp1 = [hsl.getNumber(NumberFormat.UInt16LE, 0), //h
        hsl.getNumber(NumberFormat.UInt8LE, 2), //s
        hsl.getNumber(NumberFormat.UInt8LE, 3)] //l
        if (temp1[PKSDriverHSL.H] > 330 || temp1[PKSDriverHSL.H] < 30) {
            return PKSDriverColorType.Red
        } else if (temp1[pksdriver.PKSDriverHSL.H] >= 30 && temp1[PKSDriverHSL.H] < 90) {
            return PKSDriverColorType.Yellow
        } else if (temp1[PKSDriverHSL.H] >= 90 && temp1[PKSDriverHSL.H] < 150) {
            return PKSDriverColorType.Green
        } else if (temp1[PKSDriverHSL.H] >= 150 && temp1[PKSDriverHSL.H] < 210) {
            return PKSDriverColorType.Blue//cyan but i find many blue color will sense as cyan color
        } else if (temp1[PKSDriverHSL.H] >= 210 && temp1[PKSDriverHSL.H] < 270) {
            return PKSDriverColorType.Blue
        } else if (temp1[PKSDriverHSL.H] >= 210 && temp1[PKSDriverHSL.H] < 330) {
            return PKSDriverColorType.Purple
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
     * @param buttonCheck B1 - B3
     */
    //% blockId=pksdriver_getbutton block="button %buttonCheck is pressed" subcategory="Edu Kit"
    //% group="Button"
    //% weight=70
    export function checkButton(buttonCheck: PKSDriverButton): boolean {
        let buttonvalue = pins.analogReadPin(AnalogPin.P0);
        let button = 0;
        let x = 0;
        let ans = 0;
        if (buttonCheck == PKSDriverButton.B1) {
            x = 0b100
        }
        else if (buttonCheck == PKSDriverButton.B2) {
            x = 0b010
        }
        else if (buttonCheck == PKSDriverButton.B3) {
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

    //*****************************************************************************************************//
    //IOT related code                                                                                     //
    //*****************************************************************************************************//

    /**
     * Rounds a number to the specified number of decimal places (returns a string with the requested decimals, similar to toFixed).
     * for example, roundToDecimalPlaces(3.14159, 2) returns "3.14", roundToDecimalPlaces (3.1, 3) returns "3.100"
     * @param value The number to round
     * @param decimals The number of decimal places to keep
     */
    //% blockId=pksdriver_round block="round %value to %decimals decimal places"
    //% group="Math"
    //% weight=10
    export function roundToDecimalPlaces(value: number, decimals: number): string {
        // safety
        if (decimals < 0) decimals = 0;
        if (decimals > 20) decimals = 20;

        let factor = Math.pow(10, decimals);
        let rounded = Math.round(value * factor) / factor;
        let str = "" + rounded;
        // Add trailing zeros if needed
        let dotIdx = str.indexOf(".");
        if (decimals == 0) {
            return str.split(".")[0];
        }
        if (dotIdx == -1) {
            str += ".";
            dotIdx = str.length - 1;
        }
        let decimalsNow = str.length - dotIdx - 1;
        while (decimalsNow < decimals) {
            str += "0";
            decimalsNow++;
        }
        return str;
    }

    /**
     * ESP32 IoT Driver for micro:bit
     * ESP32 I2C Command Codes (Relabeled for collision-free protocol):
     * Setup (0x30-0x33):
     *   0x30 — Set ESP32 port number
     *   0x31 — Set Wi-Fi SSID
     *   0x32 — Set Wi-Fi password
     *   0x33 — Start ESP32 Wi-Fi in station mode (connect to existing AP) transmissions (connect and begin hosting)
     *   0x34 — Start ESP32 Wi-Fi in access point mode (devices connect to ESP32) transmissions (connect and begin hosting)
     * Sending data to ESP32 (0x40):
     *   0x40 — Send sensor reading (sensor name + value)
     * Reading from ESP32 (0x50-0x51):
     *   0x50 — Status register, high bit indicates command available
     *   0x51 — Command buffer, read latest command from ESP32 (up to 32 bytes)
     */

    let esp32I2CAddress = 0x22;

    /**
     * devices to toggle from ESP client
     */
    //% block
    export enum ESPDevices {
        //% block="light"
        Light = 0x00,
        //% block="fan"
        Fan = 0x01,
        //% block="door"
        Door = 0x02
    }

    /**
     * sensors to read from ESP client
     */
    //% block
    export enum ESPSensors {
        //% block="temperature"
        Temperature = 0x00,
        //% block="humidity"
        Humidity = 0x01,
        //% block="light"
        Light = 0x02,
        //% block="ultrasound"
        Ultrasound = 0x03,
        //% block="magnetic"
        Magnetic = 0x04
    }

    /**
     * Starts I2C communication with the ESP32 extension board.
     * @param address The I2C address of the ESP32 (default 0x22)
     */
    //% blockId=pksdriver_esp32_start_i2c block="set ESP32 I2C to address %address" subcategory="IoT"
    //% group="ESP32 IoT"
    //% weight=100
    //% address.defl=0x22
    export function setI2CAddress(address: number = 0x22): void {
        esp32I2CAddress = address;
    }

    export function sendVariableCommand(cmd: number, text: string): void {
        let buf = pins.createBuffer(text.length + 2)
        buf[0] = cmd
        buf[1] = text.length
        for (let i = 0; i < text.length; i++) {
            buf[2 + i] = text.charCodeAt(i)
        }
        pins.i2cWriteBuffer(esp32I2CAddress, buf)
        basic.pause(50)
    }

    /**
     * Set the Wi-Fi station mode SSID and password for the ESP32 and start Wi-Fi transmissions (connect and begin hosting).
     * The ESP32 uses mDNS to set a friendly name.
     * @param mDNSName The mDNS name for the ESP32
     * @param SSID The Wi-Fi network name
     * @param password The Wi-Fi password
     */
    //% blockId=pksdriver_esp32_set_wifi_station_and_start block="set ESP32 in station mode with|mDNS name %mDNSName|Wi-Fi SSID %SSID|password %password|and start Wi-Fi" subcategory="IoT"
    //% inlineInputMode=external
    //% group="ESP32 IoT"
    //% weight=80
    export function setESP32WiFiStationAndStart(mDNSName: string, SSID: string, password: string): void {
        basic.pause(1000)

        sendVariableCommand(0x30, mDNSName)
        sendVariableCommand(0x31, SSID)
        sendVariableCommand(0x32, password)

        let buf = pins.createBuffer(1)
        buf[0] = 0x33
        pins.i2cWriteBuffer(esp32I2CAddress, buf)
        basic.pause(50)
    }

    /**
     * Set the Wi-Fi access point SSID and password for the ESP32 and start Wi-Fi transmissions (connect and begin hosting).
     * @param SSID The Wi-Fi network name
     * @param password The Wi-Fi password
     */
    //% blockId=pksdriver_esp32_set_wifi_access_point_and_start block="set ESP32 in access point mode with|Wi-Fi SSID %SSID|password %password|and start Wi-Fi" subcategory="IoT"
    //% inlineInputMode=external
    //% group="ESP32 IoT"
    //% weight=80
    export function setESP32WiFiAccessPointAndStart(SSID: string, password: string): void {
        basic.pause(1000)
        sendVariableCommand(0x31, SSID)
        sendVariableCommand(0x32, password)

        let buf = pins.createBuffer(1)
        buf[0] = 0x34
        pins.i2cWriteBuffer(esp32I2CAddress, buf)
        basic.pause(50)
    }

    /**
     * Send a sensor reading to the ESP32 for dashboard display (browser).
     * @param sensorName The name of the sensor (e.g. "temp")
     * @param value The value to send
     */
    //% blockId=pksdriver_send_sensor block="send %sensorName sensor value %value to ESP32" subcategory="IoT"
    //% inlineInputMode=external
    //% group="ESP32 IoT"
    //% weight=60
    export function sendSensorReading(sensorType: ESPSensors, value: number): void {
        let buf = pins.createBuffer(6);
        buf[0] = 0x40; // sensor
        buf[1] = sensorType;
        // Encode float as 4 bytes (IEEE 754)
        
        let floatBuf = pins.createBuffer(4);
        floatBuf.setNumber(NumberFormat.Float32LE, 0, value);
        for (let i = 0; i < 4; i++) buf[2 + i] = floatBuf[i];
        pins.i2cWriteBuffer(esp32I2CAddress, buf);
        // give time for ESP to process
        basic.pause(100);
    }

    // state of outputs
    let iDoor = 0;
    let iLight = 0;
    let iFan = 0;

    /**
     * Read the commands from the ESP32 module
     * The results are stored, use the accessors to access
     */
    //% blockId=pksdriver_esp_read block="read commands from ESP32" subcategory="IoT"
    //% group="ESP32 IoT"
    //% weight=60
    export function readESP32Bits(): void {
        let buf = pins.i2cReadBuffer(esp32I2CAddress, 4, false);
        // buf[0] is garbage data, see doc
        iDoor = buf[1];
        iFan = buf[2];
        iLight = buf[3];
    }

    /**
     * Public accessor of ESP devices
     */
    //% block="state of %ESPCommand" subcategory="IoT"
    //% group="ESP32 IoT"
    //% weight=60
    export function decodeESP(ESPCommand: ESPDevices): number {
        switch (ESPCommand) {
            case (ESPDevices.Door):
                return iDoor;
            case (ESPDevices.Light):
                return iLight;
            case (ESPDevices.Fan):
                return iFan;
        }
    }

    //*****************************************************************************************************//
    //IOT related code finished                                                                            //
    //*****************************************************************************************************//

    //*****************************************************************************************************//
    //Gotcha related code                                                                                  //
    //*****************************************************************************************************//\



    //*****************************************************************************************************//
    //IIC test related code                                                                                //
    //*****************************************************************************************************//

    /**
     * I2C speed options for testing I2C communication beta
     * Note: the actual speed may be affected by the hardware and may not be exactly as specified
     */
    //% block
    export enum I2CSpeed {
        //% block="standard mode (100 kHz)"
        Standard = 100000,
        //% block="fast mode (400 kHz)"
        Fast = 400000,
        //% block="fast plus mode (1 MHz)"
        FastPlus = 1000000
    }

    function isMicrobitV2(): boolean {
        return control.ramSize() > 102400;
    }

    //% block="set I2C %speed" 
    //% group="I2C speed"
    //% speed.defl=I2CSpeed.Standard
    export function setI2CSpeed(speed: I2CSpeed): void {
        let finalSpeed = speed;

        if (isMicrobitV2()) {
            //V2 max speed 1 MHz
            finalSpeed = Math.min(finalSpeed, 1000000); 
        } else {
            //V1 max speed 400 kHz
            finalSpeed = Math.min(finalSpeed, 400000);
        }
        finalSpeed = Math.max(finalSpeed, 10000);
        setI2CSpeedShim(finalSpeed);
    }

    //% shim=customI2C::setI2CSpeedShim
    function setI2CSpeedShim(speed: number): void {
        return;
    }

    //*****************************************************************************************************//
    //I2C multiplexer related code                                                                         //
    //*****************************************************************************************************//

    /**
     * I2C multiplexer channel options
     */
    export enum PKSDriverI2CChannel {
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
    * @param channelSelected which channel to select on the I2C multiplexer 
     */
    function switchI2CMultiplexer(channelSelected: PKSDriverI2CChannel): void {
        let i2c_multiplexerAddress = 0x70;
        const buf = pins.createBuffer(1);
        if (channelSelected == PKSDriverI2CChannel.C1) {
            buf[0] = 0x08
        }
        else if (channelSelected == PKSDriverI2CChannel.C2) {
            buf[0] = 0x04
        }
        else if (channelSelected == PKSDriverI2CChannel.C3) {
            buf[0] = 0x02
        }
        else if (channelSelected == PKSDriverI2CChannel.C4) {
            buf[0] = 0x01
        }
        else if (channelSelected == PKSDriverI2CChannel.C5) {
            buf[0] = 0x10
        }
        else if (channelSelected == PKSDriverI2CChannel.C6) {
            buf[0] = 0x20
        }
        else if (channelSelected == PKSDriverI2CChannel.C7) {
            buf[0] = 0x40
        }
        else if (channelSelected == PKSDriverI2CChannel.C8) {
            buf[0] = 0x80
        }
        pins.i2cWriteBuffer(i2c_multiplexerAddress, buf, false);
    }

    /**
     * Switch I2C multiplexer channel (Edu Kit)
     * @param channelSelected C1~C8 
     */
    //% blockId=pksdriver_switch_channel_edu block="switch I2C %channelSelected" subcategory="Edu Kit"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelEdu(channelSelected: PKSDriverI2CChannel): void {
        switchI2CMultiplexer(channelSelected);
    }

    /**
     * Switch I2C multiplexer channel (Maze Car)
     * @param channelSelected C1~C8
     */
    //% blockId=pksdriver_switch_channel_maze block="switch I2C %channelSelected" subcategory="Maze Car"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelMaze(channelSelected: PKSDriverI2CChannel): void {
        switchI2CMultiplexer(channelSelected);
    }

    /**
     * Switch I2C multiplexer channel (Soccer Robot)
     * @param channelSelected C1~C8
     */
    //% blockId=pksdriver_switch_channel_soccer block="switch I2C %channelSelected" subcategory="Soccer Robot"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelSoccer(channelSelected: PKSDriverI2CChannel): void {
        switchI2CMultiplexer(channelSelected);
    }

    /**
     * Switch I2C multiplexer channel (Smart Living)
     * @param channelSelected C1~C8
     */
    //% blockId=pksdriver_switch_channel_smart block="switch I2C %channelSelected" subcategory="Smart Living"
    //% group="I2C multiplexer"
    //% weight=70
    export function switchI2CChannelSmart(channelSelected: PKSDriverI2CChannel): void {
        switchI2CMultiplexer(channelSelected);
    }

    //*****************************************************************************************************//
    //I2C multiplexer related code finished                                                                //
    //*****************************************************************************************************//

    export class Joystick {
        pinX: AnalogPin;
        pinY: AnalogPin;
        pinPress: DigitalPin;
        centerX: number;
        centerY: number;
        maxDeflection: number;
        blindZonePercent: number;

        public constructor(pinX: AnalogPin, pinY: AnalogPin, pinPress: DigitalPin, centerX: number = 512, centerY: number = 512, maxDeflection: number = 512, blindZonePercent: number = 10) {
            this.pinX = pinX;
            this.pinY = pinY;
            this.pinPress = pinPress;
            this.centerX = centerX;
            this.centerY = centerY;
            this.maxDeflection = maxDeflection;
            this.blindZonePercent = blindZonePercent;
        }

        public read() {
            let rawX = pins.analogReadPin(this.pinX)
            // readAverage(this.pinX, 1);
            let rawY = pins.analogReadPin(this.pinY)
            // readAverage(this.pinY, 1);
            let dx = (rawX - this.centerX) / this.maxDeflection
            let dy = (rawY - this.centerY) / this.maxDeflection
            // Apply blind zone
            let strength = Math.sqrt(dx * dx + dy * dy)
            let blindZoneThreshold = this.blindZonePercent / 100
            if (strength <= blindZoneThreshold) {
                // Inside dead zone: force dx,dy = 0
                return { x: 0, y: 0 }
            }
            // Rescale remaining range from threshold..1 to 0..1 (optional but feels better)
            let scale = 1 / (1 - blindZoneThreshold)
            dx = dx * scale
            dy = dy * scale
            // Clamp again after scaling (should be within -1..1)
            dx = Math.max(-1, Math.min(1, dx))
            dy = Math.max(-1, Math.min(1, dy))
            return { x: dx, y: dy }
        }

        public Angle() {
            let { x: dx, y: dy } = this.read()
            // case no angle, return 0
            if (dx == 0 && dy == 0) {
                PKSDriverStepperMotorAInstance.powerOff()
                PKSDriverStepperMotorBInstance.powerOff()
                return 0
            }
            let angle = Math.atan2(dy, 0 - dx) * 180 / Math.PI
            if (angle < 0) {
                angle += 360
            }
            return angle
        }

        public strength() {
            let { x: dx, y: dy } = this.read()
            let strength = Math.sqrt(dx * dx + dy * dy)
            strength = Math.min(1, strength)
            if (strength == 0) {
                //saftey power off all motor
                PKSDriverStepperMotorAInstance.powerOff()
                PKSDriverStepperMotorBInstance.powerOff()
            }
            return strength
        }

        public isPressed() {
            return pins.digitalReadPin(this.pinPress) == 0
        }
    }

    let PKSDriverJoystickInstance: Joystick;
    let PKSDriverJoystickInitialized = false;

    /**
     * Joystick initialization, specify the x and y axis pins, the press button pin, the center value for x and y (default 512 for most joysticks), the max deflection value (default 512 for most joysticks), and the blind zone percentage (default 10%, adjust based on your joystick's sensitivity and noise)
     * @param pinX 
     * @param pinY 
     * @param centerX 
     * @param centerY 
     * @param maxDeflection 
     * @param blindZonePercent 
     */
    //% blockId=pksdriver_createjoystick block="create joystick with |x axis %pinX|y axis %pinY|press button %pinPress|centerX %centerX centerY %centerY max deflection %maxDeflection blind zone %blindZonePercent" subcategory="Gotcha"
    //% group="Joystick"
    //% pinX.defl=AnalogPin.P1 pinY.defl=AnalogPin.P2 pinPress.defl=DigitalPin.P8
    //% centerX.defl=512 centerY.defl=512 maxDeflection.defl=512 blindZonePercent.defl=10
    //% weight=90
    export function startJoystick(pinX: AnalogPin, pinY: AnalogPin, pinPress: DigitalPin, centerX: number = 512, centerY: number = 512, maxDeflection: number = 512, blindZonePercent: number = 10) {
        PKSDriverJoystickInstance = new Joystick(pinX, pinY, pinPress, centerX, centerY, maxDeflection, blindZonePercent)
        PKSDriverJoystickInitialized = true;
    }

    /**
    * Get the angle (0-360 degrees) and strength (0-1) of the joystick deflection based on the x and y values.
    * The angle is obey catesian coordinate system, 0 degree means full right, 90 degree means full up, 180 degree means full left, 270 degree means full down.
    */
    //% blockId=pksdriver_getorientation block="joystick angle" subcategory="Gotcha"
    //% group="Joystick"
    //% weight=70
    export function JoystickAngle() {
        if (!PKSDriverJoystickInitialized) {
            startJoystick(AnalogPin.P1, AnalogPin.P2, DigitalPin.P8)
        }
        return PKSDriverJoystickInstance.Angle()
    }

    /**
    * Check if the joystick button is pressed (returns true if pressed, false if not pressed)
    */
    //% blockId=pksdriver_joystickpressed block="joystick pressed" subcategory="Gotcha"
    //% group="Joystick"
    //% weight=70
    export function JoystickPressed(): boolean {
        if (!PKSDriverJoystickInitialized) {
            startJoystick(AnalogPin.P1, AnalogPin.P2, DigitalPin.P8)
        }
        return PKSDriverJoystickInstance.isPressed()
    }

    /**
    * Get the strength of the joystick deflection based on the x and y values, range from 0 to 1.
    */
    //% blockId=pksdriver_getstrength block="joystick strength" subcategory="Gotcha"
    //% group="Joystick"
    //% weight=70
    export function JoystickStrength() {
        if (!PKSDriverJoystickInitialized) {
            startJoystick(AnalogPin.P1, AnalogPin.P2, DigitalPin.P8)
        }
        return PKSDriverJoystickInstance.strength()
    }

    enum StepStage {
        //% block="step 1"
        StepStage1 = 0,
        //% block="step 2"
        StepStage2 = 1,
        //% block="step 3"
        StepStage3 = 2,
        //% block="step 4"
        StepStage4 = 3,
    }

    export class StepperMotorDriver {
        private next_step_state: StepStage = StepStage.StepStage1;
        private current_step_state: StepStage | null = null;
        private dp_Ap = PKSMotorPorts.M1P;
        private dp_An = PKSMotorPorts.M1N;
        private dp_Bp = PKSMotorPorts.M2N;
        private dp_Bn = PKSMotorPorts.M2P;
        private speed = 1 //rotation per second
        private delay = 50;
        private power_flag = true
        private last_step: StepStage | null = null;
        public a_high = 4095
        public b_high = 4095
        private low = 0

        constructor(
            DriverPinAPlus: PKSMotorPorts,
            DriverPinAMinus: PKSMotorPorts,
            DriverPinBMinus: PKSMotorPorts,
            DriverPinBPlus: PKSMotorPorts,
        ) {
            this.dp_Ap = DriverPinAPlus
            this.dp_An = DriverPinAMinus
            this.dp_Bn = DriverPinBMinus
            this.dp_Bp = DriverPinBPlus
        }
        public setSpeed(speed: number) {

        }

        private match_stage(stage: StepStage) {
            switch (stage) {
                case (StepStage.StepStage1):
                    pksdriver.setPwm(this.dp_Ap, 0, this.a_high)
                    pksdriver.setPwm(this.dp_An, 0, this.low)
                    pksdriver.setPwm(this.dp_Bp, 0, this.b_high)
                    pksdriver.setPwm(this.dp_Bn, 0, this.low)
                    control.waitMicros(this.delay)
                    break;
                case (StepStage.StepStage2):
                    pksdriver.setPwm(this.dp_Ap, 0, this.low)
                    pksdriver.setPwm(this.dp_An, 0, this.a_high)
                    pksdriver.setPwm(this.dp_Bp, 0, this.b_high)
                    pksdriver.setPwm(this.dp_Bn, 0, this.low)
                    control.waitMicros(this.delay)
                    break;
                case (StepStage.StepStage3):
                    pksdriver.setPwm(this.dp_Ap, 0, this.low)
                    pksdriver.setPwm(this.dp_An, 0, this.a_high)
                    pksdriver.setPwm(this.dp_Bp, 0, this.low)
                    pksdriver.setPwm(this.dp_Bn, 0, this.b_high)
                    control.waitMicros(this.delay)
                    break;
                case (StepStage.StepStage4):
                    pksdriver.setPwm(this.dp_Ap, 0, this.a_high)
                    pksdriver.setPwm(this.dp_An, 0, this.low)
                    pksdriver.setPwm(this.dp_Bp, 0, this.low)
                    pksdriver.setPwm(this.dp_Bn, 0, this.b_high)
                    control.waitMicros(this.delay)
                    break;
            }
        }

        public state_init(order: PKSDriverDirection = PKSDriverDirection.Clockwise) {
            if (this.power_flag == null || !this.power_flag) {
                this.power_flag = true
            } else if (!this.power_flag) {
                if (this.current_step_state !== null) {
                    this.match_stage(this.current_step_state)
                }
            }
            this.match_stage(this.next_step_state)
            this.step_count(order)
        }

        private next_state(order: PKSDriverDirection) {
            switch (this.next_step_state) {
                case (StepStage.StepStage1):
                    if (order > 0) {
                        //last : ss4
                        pksdriver.setPwm(this.dp_Bn, 0, this.low)
                        pksdriver.setPwm(this.dp_Bp, 0, this.b_high)
                    } else {
                        //last : ss2
                        pksdriver.setPwm(this.dp_An, 0, this.low)
                        pksdriver.setPwm(this.dp_Ap, 0, this.a_high)
                    }
                    break;
                case (StepStage.StepStage2):
                    if (order > 0) {
                        //last : ss1
                        pksdriver.setPwm(this.dp_Ap, 0, this.low)
                        pksdriver.setPwm(this.dp_An, 0, this.a_high)
                    } else {
                        //last : ss3
                        pksdriver.setPwm(this.dp_Bn, 0, this.low)
                        pksdriver.setPwm(this.dp_Bp, 0, this.b_high)
                    }
                    break;
                case (StepStage.StepStage3):
                    if (order > 0) {
                        //last : ss2
                        pksdriver.setPwm(this.dp_Bp, 0, this.low)
                        pksdriver.setPwm(this.dp_Bn, 0, this.b_high)
                    } else {
                        //last : ss4
                        pksdriver.setPwm(this.dp_Ap, 0, this.low)
                        pksdriver.setPwm(this.dp_An, 0, this.b_high)
                    }
                    break;
                case (StepStage.StepStage4):
                    if (order > 0) {
                        //last : ss3
                        pksdriver.setPwm(this.dp_An, 0, this.low)
                        pksdriver.setPwm(this.dp_Ap, 0, this.b_high)
                    } else {
                        //last : ss1
                        pksdriver.setPwm(this.dp_Bp, 0, this.low)
                        pksdriver.setPwm(this.dp_Bn, 0, this.b_high)
                    }
                    break;
            }
            control.waitMicros(this.delay)
            this.step_count(order)
        }
        private step_count(order: PKSDriverDirection) {
            this.current_step_state = this.next_step_state
            this.next_step_state = this.current_step_state + order
            if (this.next_step_state > 3) {
                this.next_step_state = 0
            }
            else if (this.next_step_state < 0) {
                this.next_step_state = 3
            }
        }
        public powerOff() {
            this.power_flag = false
            pksdriver.setPwm(this.dp_Ap, 0, 0)
            pksdriver.setPwm(this.dp_An, 0, 0)
            pksdriver.setPwm(this.dp_Bp, 0, 0)
            pksdriver.setPwm(this.dp_Bn, 0, 0)
        }

        public steps(order: PKSDriverDirection, steps: number = 1) {
            let i = 1
            this.state_init(order)
            while (i < steps) {
                this.next_state(order)
                i++
            }
        }
    }
    
    //Hbot follows cartesian coordinate system, x axis positive to the right, y axis positive to the top, angle is obeying cartesian coordinate system as well, 0 degree means full right, 90 degree means full up, 180 degree means full left, 270 degree means full down.
    let PKS_HBOT_x_counter = 0
    let PKS_HBOT_y_counter = 0
    let PKS_HBOT_x_max = 550
    let PKS_HBOT_x_min = 0
    let PKS_HBOT_y_max = 550
    let PKS_HBOT_y_min = 0
    let PKSDriverStepperMotorAInstance: StepperMotorDriver = new StepperMotorDriver(PKSMotorPorts.M1P, PKSMotorPorts.M1N, PKSMotorPorts.M2N, PKSMotorPorts.M2P)
    let PKSDriverStepperMotorBInstance: StepperMotorDriver = new StepperMotorDriver(PKSMotorPorts.M3N, PKSMotorPorts.M3P, PKSMotorPorts.M4N, PKSMotorPorts.M4P)

    export enum StepperMotor{
        //% block="A"
        A,
        //% block="B"
        B
    }

    /**
    * Create a stepper motor driver instance with specified coil pins. The stepper motor will be controlled by energizing the coils in a specific sequence to achieve rotation. The speed of rotation can be adjusted by changing the delay between steps in the code. Note: the actual speed may be affected by the hardware and may not be exactly as specified.
    * @param stepperCoilAPlus The pin connected to coil A+
    * @param stepperCoilAMinus The pin connected to coil A-
    * @param stepperCoilBPlus The pin connected to coil B+
    * @param stepperCoilBMinus The pin connected to coil B-
    */
    //% blockId=pksdriver_createstepper block="create stepper motor A with |coil A+ %stepperCoilAPlus |coil A- %stepperCoilAMinus |coil B+ %stepperCoilBPlus |coil B- %stepperCoilBMinus" subcategory="Gotcha"
    //% group="Stepper Motor"
    //% stepperCoilAPlus.defl=PKSMotorPorts.M1P
    //% stepperCoilAMinus.defl=PKSMotorPorts.M1N
    //% stepperCoilBPlus.defl=PKSMotorPorts.M2P
    //% stepperCoilBMinus.defl=PKSMotorPorts.M2N
    //% weight=50
    export function createStepperMotorA(stepperCoilAPlus: PKSMotorPorts, stepperCoilAMinus: PKSMotorPorts, stepperCoilBPlus: PKSMotorPorts, stepperCoilBMinus: PKSMotorPorts): void {
        PKSDriverStepperMotorAInstance = new StepperMotorDriver(stepperCoilAPlus, stepperCoilAMinus, stepperCoilBPlus, stepperCoilBMinus)
    }

    /**
    * Create a stepper motor driver instance with specified coil pins. The stepper motor will be controlled by energizing the coils in a specific sequence to achieve rotation. The speed of rotation can be adjusted by changing the delay between steps in the code. Note: the actual speed may be affected by the hardware and may not be exactly as specified.
    * @param stepperCoilAPlus The pin connected to coil A+
    * @param stepperCoilAMinus The pin connected to coil A-
    * @param stepperCoilBPlus The pin connected to coil B+
    * @param stepperCoilBMinus The pin connected to coil B-
    */
    //% blockId=pksdriver_createstepperB block="create stepper motor B with |coil A+ %stepperCoilAPlus |coil A- %stepperCoilAMinus |coil B+ %stepperCoilBPlus |coil B- %stepperCoilBMinus" subcategory="Gotcha"
    //% group="Stepper Motor"
    //% stepperCoilAPlus.defl=PKSMotorPorts.M3P 
    //% stepperCoilAMinus.defl=PKSMotorPorts.M3N
    //% stepperCoilBPlus.defl=PKSMotorPorts.M4P
    //% stepperCoilBMinus.defl=PKSMotorPorts.M4N
    //% weight=50
    export function createStepperMotorB(stepperCoilAPlus: PKSMotorPorts, stepperCoilAMinus: PKSMotorPorts, stepperCoilBPlus: PKSMotorPorts, stepperCoilBMinus: PKSMotorPorts): void {
        PKSDriverStepperMotorBInstance = new StepperMotorDriver(stepperCoilAPlus, stepperCoilAMinus, stepperCoilBPlus, stepperCoilBMinus)
    }

    //% block
    export enum PKSHBotCardinalDirections {
        //% block="north (0°)"
        North,
        //% block="east (90°)"
        East,
        //% block="south (180°)"
        South,
        //% block="west (270°)"
        West,
    }

    export function _stepperMotorHBotMove(direction: PKSHBotCardinalDirections, steps: number = 1, LimitBreak: boolean = false) {
        ensurePCA9685Freq(STEPPER_FREQ)
        let step_count = 0
        //break limit if LimitBreak is true, otherwise limit the movement to the defined min/max values
        if (direction == PKSHBotCardinalDirections.North &&  (PKS_HBOT_y_counter <= PKS_HBOT_y_max || LimitBreak)) {
            while (step_count < steps && (PKS_HBOT_y_counter <= PKS_HBOT_y_max || LimitBreak)) {
                PKSDriverStepperMotorAInstance.steps(pksdriver.PKSDriverDirection.Clockwise)
                PKSDriverStepperMotorBInstance.steps(pksdriver.PKSDriverDirection.Counterclockwise)
                step_count += 1
                PKS_HBOT_y_counter += 1
            }
        } else if (direction == PKSHBotCardinalDirections.East && (PKS_HBOT_x_counter <= PKS_HBOT_x_max || LimitBreak)) {
            while (step_count < steps && (PKS_HBOT_x_counter <= PKS_HBOT_x_max || LimitBreak)) {
                PKSDriverStepperMotorAInstance.steps(pksdriver.PKSDriverDirection.Counterclockwise)
                PKSDriverStepperMotorBInstance.steps(pksdriver.PKSDriverDirection.Counterclockwise)
                step_count += 1
                PKS_HBOT_x_counter += 1
            }
        } else if (direction == PKSHBotCardinalDirections.South && (PKS_HBOT_y_counter >= PKS_HBOT_y_min || LimitBreak)) {
            while (step_count < steps && (PKS_HBOT_y_counter >= PKS_HBOT_y_min || LimitBreak)) {
                PKSDriverStepperMotorAInstance.steps(pksdriver.PKSDriverDirection.Counterclockwise)
                PKSDriverStepperMotorBInstance.steps(pksdriver.PKSDriverDirection.Clockwise)
                step_count += 1
                PKS_HBOT_y_counter -= 1
            }
        } else if (direction == PKSHBotCardinalDirections.West && (PKS_HBOT_x_counter >= PKS_HBOT_x_min || LimitBreak)) {
            while (step_count < steps && (PKS_HBOT_x_counter >= PKS_HBOT_x_min || LimitBreak)) {
                PKSDriverStepperMotorAInstance.steps(pksdriver.PKSDriverDirection.Clockwise)
                PKSDriverStepperMotorBInstance.steps(pksdriver.PKSDriverDirection.Clockwise)
                step_count += 1
                PKS_HBOT_x_counter -= 1
            }
        } else {
            PKSDriverStepperMotorAInstance.powerOff()
            PKSDriverStepperMotorBInstance.powerOff()
        }
    }

    /**
    * This function controls two stepper motors in a coordinated way to move a robot in the specified cardinal direction for a certain number of steps. The direction parameter determines the sequence of steps for each motor to achieve the desired movement direction. 
    * @param direction The cardinal direction to move the robot (e.g. North, East, South, West)
    * @param steps The number of steps to move in the specified direction (default is 1)
    * @param LimitBreak Whether to bypass the movement limits (default false, for testing and error recovery)
    */
    //% blockId=pksdriver_stepper_motor_hbot_step block="Hbot drive in %direction for %steps steps with LimitBreak %LimitBreak" subcategory="Gotcha"
    //% group="Stepper Motor"
    //% steps.defl=1
    //% LimitBreak.defl=false
    //% weight=40
    export function stepperMotorHBotMove(direction: PKSHBotCardinalDirections, steps: number = 1, LimitBreak: boolean = false) {
        _stepperMotorHBotMove(direction, steps, LimitBreak)
        PKSDriverStepperMotorAInstance.powerOff()
        PKSDriverStepperMotorBInstance.powerOff()
    }

    /**
    * This function takes the angle of the joystick deflection and maps it to one of the 8 cardinal directions (N, NE, E, SE, S, SW, W, NW) to control the movement of a robot. The joystick angle is typically measured in degrees, where 0 degrees corresponds to the right (east) direction and increases counterclockwise. The function determines which cardinal direction the joystick is pointing to based on the angle and then calls the stepper motor control function to move the robot in that direction.
    * @param joystickAngle The angle of the joystick deflection in degrees (0-360)
    * @param joystickStrength The strength of the joystick deflection (0-100)
    */
    //% blockId=pksdriver_stepper_motor_hbot_joystick block="Hbot drive by %joystickAngle and %joystickStrength" subcategory="Gotcha"
    //% weight=30
    export function HBotMoveByJoystick(joystickAngle: number, joystickStrength: number) {
        if (joystickStrength > 0) {
            if (joystickAngle >= 315 || joystickAngle < 45 ) {
                _stepperMotorHBotMove(PKSHBotCardinalDirections.East,4)
            } else if (joystickAngle >= 45 && joystickAngle < 135) {
                _stepperMotorHBotMove(PKSHBotCardinalDirections.North,4)
            } else if (joystickAngle >= 135 && joystickAngle < 225) {
                _stepperMotorHBotMove(PKSHBotCardinalDirections.West,4)
            } else if (joystickAngle >= 225 && joystickAngle < 315) {
                _stepperMotorHBotMove(PKSHBotCardinalDirections.South,4)
            }
        }
        else {
            PKSDriverStepperMotorAInstance.powerOff()
            PKSDriverStepperMotorBInstance.powerOff()
        }
    }

    /**
     * Get the current X direction movement step count
     */
    //% blockId=pksdriver_hbot_x_counter block="Hbot X Counter" subcategory="Gotcha"
    //% weight=10
    export function HBotXCounter() {
        return PKS_HBOT_x_counter
    }

    /**
     * Get the current Y direction movement step count
     */
    //% blockId=pksdriver_hbot_y_counter block="Hbot Y Counter" subcategory="Gotcha"
    //% weight=10
    export function HBotYCounter() {
        return PKS_HBOT_y_counter
    }

    /**
     * Reset the HBot movement counters to zero by moving the robot back to the origin (0,0) position.
     */
    //% blockId=pksdriver_hbot_reset_counter block="reset Hbot counter" subcategory="Gotcha"
    //% weight=20
    export function resetHBotCounter() { 
        while (PKS_HBOT_x_counter > 0) {
            _stepperMotorHBotMove(PKSHBotCardinalDirections.West)
        }
        while (PKS_HBOT_y_counter > 0) {
            _stepperMotorHBotMove(PKSHBotCardinalDirections.South)
        }
        //extra step to ensure fully reset, in case of any mechanical issues
        stepperMotorHBotMove(PKSHBotCardinalDirections.West,30)
        stepperMotorHBotMove(PKSHBotCardinalDirections.South, 30)
    }

}