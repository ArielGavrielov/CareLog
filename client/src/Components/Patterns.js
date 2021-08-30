export const emailPattern = {
        value: /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
        message: "Email address invalid."
};

export const phonePattern = {
        value: /^\+?(972|0)(\-)?0?([5]{1}[0-9]{1}\d{7})$/,
        message: "Phone number is invalid"
};

export const passwordPattern = {
        value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/,
        message: "Password must contains uppercase,lowercase,number"
};

export const firstnamePattern =  {
        value: /^(?=.{2,20}$)[a-zA-Z]+(?:[-'\s][a-zA-Z]{2,20})*$/,
        message: "First name must only contains a letters/spaces."
};

export const lastnamePattern =  {
        value: /^(?=.{2,20}$)[a-zA-Z]+(?:[-'\s][a-zA-Z]{2,20})*$/,
        message: "Last name must only contains a letters/spaces."
};

export const birthdatePattern = {
        value: /(0[1-9]|1[0-9]|2[0-9]|3[01]).(0[1-9]|1[012]).[0-9]{4}/,
        message: "Please fill a date"
};