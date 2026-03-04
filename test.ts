// tests go here; this will not be compiled when this package is used as a library
pksdriver.motorStopAll()
basic.forever(function () {
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M1, pksdriver.PKSDriverDir.CW, 80)
    pksdriver.motorRun(pksdriver.PKSDriverMotors.M2, pksdriver.PKSDriverDir.CCW, 80)
    basic.pause(1700)
  
    pksdriver.motorStopAll()
  
    basic.pause(2000)
})
