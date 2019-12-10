int led1 = 9;
int potPin = A0;
int potVal = 0;
int inByte;
int count;
int buttonState = LOW;
int button = 2;

void setup() {
  Serial.begin(9600);
  pinMode(led1, OUTPUT);
  pinMode(button, INPUT);
}

void loop() {
  potVal = analogRead(potPin);
  buttonState = digitalRead(button);

  
  if (Serial.available() > 0) {
    inByte = Serial.read();
    if (inByte == 1) {
      digitalWrite(led1, HIGH);
      count = 150;
    }
    Serial.print(potVal);
    Serial.print(",");
    if (buttonState == HIGH) {
      Serial.println(1);
    }
    else {
      Serial.println(0);
    }
  }
  if (count < 0) {
    digitalWrite(led1, LOW);
  }
  count--;
}
