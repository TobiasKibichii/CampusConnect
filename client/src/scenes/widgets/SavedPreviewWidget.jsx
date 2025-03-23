import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SavedPreview = () => {
  const navigate = useNavigate();
  return (
    <Box p="1rem" border="1px solid #ccc" borderRadius="8px" mt="1rem">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="1rem"
      >
        <Typography variant="h6">Your Saved Items</Typography>
        {/* Clickable button that leads to the full saved posts section */}
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/saved")}
        >
          View Saved Posts
        </Button>
      </Box>
      
    </Box>
  );
};

export default SavedPreview;
