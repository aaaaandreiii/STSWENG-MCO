const receipt = $('#receipt-container')[0];

const printButton = $('#print-it')[0];
const saveButton = $('#save-it')[0];

printButton.onclick = () => {
    window.print();
};

saveButton.onclick = () => {
    html2pdf(receipt, { filename: 'Receipt ' + $('#id').text() });
};