#include "pxt.h"

namespace customI2C {
     //%
    void setI2CSpeedShim(int speed) {
#if MICROBIT_CODAL
        uBit.i2c.setFrequency(speed);
#else
        uBit.i2c.frequency(speed);
#endif
    }

}