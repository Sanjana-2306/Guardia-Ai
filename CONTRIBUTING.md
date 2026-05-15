# Contributing to Guardia-AI

Guidelines for contributing to the Guardia-AI fraud detection platform.

## Development Environment

### Prerequisites

- Java 21+
- Node.js 18+
- Maven 3.9+
- Git
- Your favorite IDE (IntelliJ IDEA recommended)

### Setup

```bash
# Clone repository
git clone https://github.com/Sanjana-2306/Guardia-Ai.git
cd Guardia-Ai

# Backend setup
cd backend
mvn clean install
mvn spring-boot:run

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## Code Style Guidelines

### Java

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use 4-space indentation
- Max line length: 120 characters
- Use meaningful variable names
- Add Javadoc for public methods
- Use Lombok annotations to reduce boilerplate

**Example:**
```java
/**
 * Evaluate fraud risk for a transaction.
 * 
 * @param transaction the transaction to evaluate
 * @return FraudResult with risk score and triggered rules
 */
public FraudResult evaluate(Transaction transaction) {
    // Implementation
}
```

### JavaScript/React

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use 2-space indentation
- Use functional components with hooks
- Add PropTypes documentation
- Use meaningful component names
- Prefer const over let, don't use var

**Example:**
```jsx
import PropTypes from 'prop-types';

function MyComponent({ title, onAction }) {
  return (
    <div className="component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default MyComponent;
```

## Git Workflow

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, perf, test, chore
**Example:**
```
feat(fraud-detection): add velocity check rule

- Implement velocity detection algorithm
- Add transaction counting logic
- Add unit tests

Closes #123
```

### Creating a Pull Request

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes with meaningful commits

3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

4. Open PR on GitHub with description

5. Address review comments

6. Merge after approval

## Testing

### Backend Testing

```bash
cd backend

# Run tests
mvn test

# Run with coverage
mvn test jacoco:report

# View coverage report
# target/site/jacoco/index.html
```

### Frontend Testing

```bash
cd frontend

# Add Vitest (test framework)
npm install -D vitest @testing-library/react

# Run tests
npm run test

# With coverage
npm run test -- --coverage
```

### Example Backend Test

```java
@SpringBootTest
@DisplayName("Fraud Detection Service Tests")
class FraudDetectionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private FraudDetectionService fraudDetectionService;

    @Test
    @DisplayName("Should flag transaction with velocity anomaly")
    void testVelocityCheck() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        Transaction tx = Transaction.builder()
            .userId("user-1")
            .timestamp(now)
            .build();
        
        when(transactionRepository.countByUserIdAndTimestampAfter(
            "user-1", now.minusSeconds(60)
        )).thenReturn(5L);

        // Act
        FraudResult result = fraudDetectionService.evaluate(tx);

        // Assert
        assertTrue(result.isFraudulent());
        assertTrue(result.getTriggeredRules().contains("VELOCITY_CHECK"));
    }
}
```

## Adding Features

### Adding a New Fraud Rule

1. **Add logic to `FraudDetectionService.java`:**
   ```java
   private FraudCheckOutcome checkMyNewRule(Transaction tx) {
       // Implementation
       if (condition) {
           return FraudCheckOutcome.flagged("Reason...");
       }
       return FraudCheckOutcome.safe();
   }
   ```

2. **Call in `evaluate()` method:**
   ```java
   FraudCheckOutcome myRule = checkMyNewRule(transaction);
   if (myRule.flagged()) {
       triggeredRules.add("MY_NEW_RULE");
       riskScore += 25.0;
   }
   ```

3. **Add frontend constant:**
   ```js
   // constants.js
   MY_NEW_RULE: {
       label: 'My New Rule',
       icon: '🔍',
       severity: 'warning',
   }
   ```

4. **Test thoroughly:**
   - Write unit tests
   - Test with demo transactions
   - Verify UI displays correctly

### Adding a New Frontend Component

1. Create component file in `src/components/`
2. Document with JSDoc comments
3. Add PropTypes validation
4. Export with proper naming
5. Update parent components

## Documentation

### Backend Documentation

- Use Swagger annotations for API endpoints
- Keep README.md updated
- Document complex algorithms
- Add inline comments for unclear logic

### Frontend Documentation

- Use JSDoc comments
- Document component props
- Add usage examples
- Keep SETUP.md current

## Performance Considerations

### Backend

- Use database indexing for frequently queried fields
- Implement caching for repetitive operations
- Use pagination for large datasets
- Monitor query performance

### Frontend

- Lazy load components
- Memoize expensive computations
- Optimize re-renders
- Use code splitting

## Security Best Practices

- Never commit sensitive data (.env files)
- Validate all user inputs
- Use parameterized queries
- Implement CSRF protection
- Keep dependencies updated
- Run security scans: `npm audit`, `mvn dependency-check:check`

## Reporting Issues

- Use GitHub Issues
- Provide clear reproduction steps
- Include environment details
- Attach relevant logs or screenshots
- Label appropriately (bug, enhancement, documentation)

## Getting Help

- Check existing documentation
- Search open/closed issues
- Join discussions
- Contact maintainers

## Release Process

1. Update version in `pom.xml` and `package.json`
2. Update CHANGELOG
3. Create release notes
4. Tag release: `git tag v1.0.0`
5. Build and test thoroughly
6. Deploy to production

---

Thank you for contributing to Guardia-AI! Your help makes security better for everyone.
