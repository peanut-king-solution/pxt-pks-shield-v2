#include "pxt.h"

namespace customI2C {
     //%
    void setI2CSpeedShim(int speed) {
        uBit.i2c.setFrequency(speed);
    }

}