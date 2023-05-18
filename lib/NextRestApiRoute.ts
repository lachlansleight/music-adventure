import { NextApiRequest, NextApiResponse } from "next";

export class RestError extends Error {
    constructor(message: string, errorCode: number) {
        super(message, { cause: String(errorCode) });
    }
}

/** General-purpose utility class to handle API routes */
export class NextRestApiRoute {
    /** The API route - used for error messages */
    path: string;
    /** HTTP Get request */
    get: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
    /** HTTP Post request */
    post: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
    /** HTTP Put request */
    put: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
    /** HTTP Patch request */
    patch: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
    /** HTTP Delete request */
    delete: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

    /** Initializes a new API route with the provided path. By default, all routes will return `405 not supported` errors.
     * Assign methods to the various REST verbs to allow them for this route
     */
    constructor(path: string) {
        this.path = path;
        this.get = async (req, res) =>
            this.handleError(req, res, 405, new Error(`GET not supported for ${this.path}`));
        this.post = async (req, res) =>
            this.handleError(req, res, 405, new Error(`POST not supported for ${this.path}`));
        this.put = async (req, res) =>
            this.handleError(req, res, 405, new Error(`PUT not supported for ${this.path}`));
        this.patch = async (req, res) =>
            this.handleError(req, res, 405, new Error(`PATCH not supported for ${this.path}`));
        this.delete = async (req, res) =>
            this.handleError(req, res, 405, new Error(`DELETE not supported for ${this.path}`));
    }

    /** Handles an API request - this should replace the normal API page's export default method
     * Note that this needs to be done as follows:
     * `export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);`
     */
    public async handle(req: NextApiRequest, res: NextApiResponse) {
        try {
            if (req.method === "GET") await this.get(req, res);
            else if (req.method === "POST") await this.post(req, res);
            else if (req.method === "PUT") await this.put(req, res);
            else if (req.method === "PATCH") await this.patch(req, res);
            else if (req.method === "DELETE") await this.delete(req, res);
            else this.handleError(req, res, 405, new Error(`Unknown method name`));
        } catch (error: any) {
            let statusCode = 500;
            if (error.cause?.message && !Number.isNaN(Number(error.cause.message)))
                statusCode = Number(error.cause.message);
            this.handleError(req, res, statusCode, error);
        }
    }

    private handleError(req: NextApiRequest, res: NextApiResponse, statusCode: number, error: any) {
        if (error.message) console.error(`Failed to ${req.method} ${this.path}`, error.message);
        else {
            console.error(`Failed to ${req.method} ${this.path}`);
            console.error(error);
        }
        res.status(statusCode).json({
            success: false,
            error: error.message || error,
            code: statusCode,
        });
    }
}
