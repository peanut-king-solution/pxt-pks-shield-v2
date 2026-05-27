#include "pxt.h"

namespace customI2C {
    /**
     * define the speed of i2c, the default value is 100000
     * @param speed the speed of i2c
     */

     //%
    void setI2CSpeedShim(int speed) {
        uBit.i2c.setFrequency(speed);
    }

}