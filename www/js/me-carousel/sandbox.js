// eslint-disable-next-line no-undef
const parent = document.querySelector("me-carousel");

const children = `
    <img
        src="https://dribbble.s3.amazonaws.com/users/322/screenshots/872485/coldchase.jpg"
        alt="image 1"
    />
    <img
        src="https://dribbble.s3.amazonaws.com/users/322/screenshots/980517/icehut_sm.jpg"
        alt="image 2"
    />
    <img
        src="https://dribbble.s3.amazonaws.com/users/322/screenshots/943660/hq_sm.jpg"
        alt="image 3"
    />
    <img
        src="https://dribbble.s3.amazonaws.com/users/322/screenshots/599584/home.jpg"
        alt="image 4"
    />
`;

if (parent) parent.innerHTML = children;
