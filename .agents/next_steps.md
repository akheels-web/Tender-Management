# Next Steps & Future Enhancements

## Security & Scaling
- **Distributed Rate Limiting:** As the application scales to a multi-node or clustered deployment, migrate the current in-memory authentication rate limiter to a centralized store like Redis. This will ensure rate limits are strictly enforced across all server instances.
