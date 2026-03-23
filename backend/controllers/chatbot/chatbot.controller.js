import { askPriceService } from "../../services/chatbot/askPrice.services.js";

export const webhookController = async (req, res, next) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    const intentMap = {
      Hoi_Gia_San_Pham: askPriceService,
    };

    if (intentMap[intentName]) {
      const responseData = await intentMap[intentName](parameters);
      return res.json(responseData);
    } else {
      return res.json({
        fulfillmentText:
          "Dạ tính năng này em đang được nâng cấp, anh/chị vui lòng đợi chút nhé...",
      });
    }
  } catch (error) {
    console.error("Lỗi sập Webhook Controller:", error);
    return res.json({
      fulfillmentText:
        "Dạ hệ thống chatbot đang bảo trì, bạn liên hệ Hotline giúp em nhé!",
    });
  }
};
