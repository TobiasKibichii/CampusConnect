import { Box } from "@mui/material";

const CLOUDINARY_BASE = process.env.CLOUDINARY_BASE;
const UserImage = ({ image, size = "60px" }) => {
  console.log(CLOUDINARY_BASE);
  return (
    <Box width={size} height={size}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt="user"
        src={`${image}`}
      />
    </Box>
  );
};

export default UserImage;
