import { config } from "../../config";
import { ApiError } from "../../utils/ApiError";

export interface ISSLCommerzInitData {
  transactionId: string;
  amount: number | string;
  ideaTitle: string;
  userName: string;
  userEmail: string;
}

export interface ISSLCommerzValidationResponse {
  status: string;
  tran_id: string;
  val_id: string;
  amount: string;
  currency: string;
  card_type?: string;
  bank_tran_id?: string;
  card_brand?: string;
  error?: string;
}

export class SSLCommerzService {
  private static getSessionApiUrl(): string {
    return config.payment.isLive
      ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
  }

  private static getValidationApiUrl(): string {
    return config.payment.isLive
      ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
      : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
  }

  /**
   * Initialize payment session with SSLCommerz
   */
  public static async initPayment(
    data: ISSLCommerzInitData
  ): Promise<{ gatewayUrl: string; sessionKey?: string }> {
    const storeId = config.payment.storeId;
    const storePassword = config.payment.storePassword;

    // Graceful fallback for local development if credentials not yet set
    if (!storeId || !storePassword) {
      console.warn("⚠️ SSLCommerz credentials missing. Using local checkout simulation URL.");
      return {
        gatewayUrl: `${config.clientUrl}/payment/checkout?transactionId=${data.transactionId}&amount=${data.amount}`,
      };
    }

    const serverUrl = config.payment.serverUrl.replace(/\/$/, "");

    const payload = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: Number(data.amount).toFixed(2),
      currency: "BDT",
      tran_id: data.transactionId,
      success_url: `${serverUrl}/api/v1/payments/ssl/success`,
      fail_url: `${serverUrl}/api/v1/payments/ssl/fail`,
      cancel_url: `${serverUrl}/api/v1/payments/ssl/cancel`,
      ipn_url: `${serverUrl}/api/v1/payments/ssl/ipn`,
      shipping_method: "NO",
      product_name: data.ideaTitle.slice(0, 255),
      product_category: "Sustainability Idea",
      product_profile: "digital-goods",
      cus_name: data.userName || "EcoSpark Member",
      cus_email: data.userEmail,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
    });

    try {
      const response = await fetch(this.getSessionApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      });

      const result = (await response.json()) as {
        status?: string;
        GatewayPageURL?: string;
        sessionkey?: string;
        failedreason?: string;
      };

      if (result.status === "SUCCESS" && result.GatewayPageURL) {
        return {
          gatewayUrl: result.GatewayPageURL,
          sessionKey: result.sessionkey,
        };
      }

      console.error("❌ SSLCommerz init failed:", result.failedreason || result);
      throw new ApiError(
        500,
        result.failedreason || "Failed to initialize SSLCommerz payment gateway"
      );
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      console.error("❌ SSLCommerz Request Error:", error.message);
      throw new ApiError(500, `SSLCommerz gateway communication error: ${error.message}`);
    }
  }

  /**
   * Validate payment transaction server-to-server with SSLCommerz
   */
  public static async validatePayment(
    valId: string
  ): Promise<ISSLCommerzValidationResponse> {
    const storeId = config.payment.storeId;
    const storePassword = config.payment.storePassword;

    // Sandbox simulated validation
    if (!storeId || !storePassword) {
      return {
        status: "VALID",
        tran_id: "SIMULATED",
        val_id: valId,
        amount: "0",
        currency: "BDT",
      };
    }

    const validationUrl = `${this.getValidationApiUrl()}?val_id=${encodeURIComponent(
      valId
    )}&store_id=${encodeURIComponent(storeId)}&store_passwd=${encodeURIComponent(
      storePassword
    )}&format=json`;

    try {
      const response = await fetch(validationUrl, {
        method: "GET",
      });

      const data = (await response.json()) as ISSLCommerzValidationResponse;

      return data;
    } catch (error: any) {
      console.error("❌ SSLCommerz Validation Error:", error.message);
      throw new ApiError(500, `Failed to validate payment with SSLCommerz: ${error.message}`);
    }
  }
}

export default SSLCommerzService;
