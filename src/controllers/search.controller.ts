import type { Request, Response } from "express";
import { productService } from "../services/product.service";
import { serviceService } from "../services/service.service";

export class SearchController {
  async search(req: Request, res: Response): Promise<Response> {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const [products, services] = await Promise.all([
      productService.searchPublic(query),
      serviceService.searchPublic(query),
    ]);

    return res.json({ query, products, services });
  }
}

export const searchController = new SearchController();
