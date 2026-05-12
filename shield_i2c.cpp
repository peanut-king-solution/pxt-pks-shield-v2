#include "pxt.h"

namespace customized_i2c {
    /**
     * define the speed of i2c, the default value is 100000
     * @param speed the speed of i2c
     */

     //%
    void setSpeed(int speed) {
        uBit.i2c.setFrequency(speed);
    }

}