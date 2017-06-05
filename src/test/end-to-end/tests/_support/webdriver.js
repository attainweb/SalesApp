export const waitAndClickButton = (buttonClass) => {
  client.waitForVisible(buttonClass);
  client.click(buttonClass);
};

export const waitAndSetValue = function(inputName, inputValue) {
  client.waitForVisible(inputName);
  client.setValue(inputName, inputValue);
};

export const waitAndGetValue = function(selectName) {
  client.waitForVisible(selectName);
  return client.getValue(selectName);
};

export const waitAndGetText = function(selectName) {
  client.waitForVisible(selectName);
  return client.getText(selectName);
};

export const waitAndSelect = function(selectName, selectValue) {
  client.waitForVisible(selectName);
  client.selectByValue(selectName, selectValue);
};

export const waitAndCheck = function(selectName) {
  client.waitForVisible(selectName);
  const isChecked = client.isSelected(selectName);
  if (!isChecked) {
    client.click(selectName);
  }
};
export const waitAndUncheck = function(selectName) {
  client.waitForVisible(selectName);
  const isChecked = client.isSelected(selectName);
  if (isChecked) {
    client.click(selectName);
  }
};

export const pressEnter = function() {
  client.keys('\uE007');
};

export const getQueueItemValueByEmail = function(userEmail, columnClass) {
  const selector = `tr:has(td:contains('${userEmail}')) td.${columnClass}`;
  return selector;
};
